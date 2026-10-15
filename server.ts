import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Maximum payload size for document image uploads
app.use(express.json({ limit: '12mb' }));

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// Endpoint to check health and OCR capability status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasOcrCapability: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Endpoint for OCR & field extraction
app.post('/api/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', documentTypeHint = 'Identity Document' } = req.body || {};

    // 1. Validate payload presence
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: imageBase64 data string is required.'
      });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: ${mimeType}. Allowed formats: JPG, JPEG, PNG, WEBP.`
      });
    }

    // 3. Clean and check data length
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim();
    const approxBytes = Math.ceil((cleanBase64.length * 3) / 4);

    if (approxBytes > MAX_IMAGE_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Image file size exceeds the 10MB limit.'
      });
    }

    // 4. Graceful fallback if OCR key is not configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        requiresManualEntry: true,
        error: 'Vision OCR service is not configured on this server. Please enter document fields manually.'
      });
    }

    // 5. Initialize Gemini client safely
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are a document transcription and OCR assistant.
Analyze this image of an official Indian document (${documentTypeHint}).
Extract readable textual values into the designated JSON fields:
- name: Full name of the individual as printed in Latin/English text.
- fatherOrSpouseName: Father, spouse, or guardian name if mentioned.
- dob: Date of birth as printed (e.g. "15/08/1990", "1990-08-15", or year only "1990").
- dobFormatted: ISO YYYY-MM-DD if full date is readable, or YYYY if only year is printed.
- gender: Gender (MALE, FEMALE, or OTHER) if recorded.
- address: Residential address text as recorded.
- pincode: 6-digit postal PIN code if present.
- documentNumber: Identification / card number printed.
- documentType: Detected document category.
- confidence: Estimated OCR transcription confidence score between 0.0 and 1.0, or null if uncertain.

Rules:
- If a field is missing, unclear, or unreadable, set it to an empty string ("") or null.
- Do NOT fabricate, invent, or guess unreadable text.
- Do NOT infer authenticity. Only transcribe visible text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            fatherOrSpouseName: { type: Type.STRING },
            dob: { type: Type.STRING },
            dobFormatted: { type: Type.STRING },
            gender: { type: Type.STRING },
            address: { type: Type.STRING },
            pincode: { type: Type.STRING },
            documentNumber: { type: Type.STRING },
            documentType: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: 'OCR confidence 0.0 to 1.0 or null' }
          },
          required: ['name', 'dob', 'address']
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      return res.status(200).json({
        success: false,
        error: 'OCR model did not return textual output. Please enter details manually.'
      });
    }

    try {
      const parsedData = JSON.parse(textOutput);

      // Sanitize confidence: never fabricate a value
      let sanitizedConfidence: number | null = null;
      if (typeof parsedData.confidence === 'number' && parsedData.confidence >= 0 && parsedData.confidence <= 1) {
        sanitizedConfidence = Math.round(parsedData.confidence * 100) / 100;
      }

      return res.json({
        success: true,
        data: {
          name: typeof parsedData.name === 'string' ? parsedData.name.trim() : '',
          fatherOrSpouseName: typeof parsedData.fatherOrSpouseName === 'string' ? parsedData.fatherOrSpouseName.trim() : '',
          dob: typeof parsedData.dob === 'string' ? parsedData.dob.trim() : '',
          dobFormatted: typeof parsedData.dobFormatted === 'string' ? parsedData.dobFormatted.trim() : '',
          gender: typeof parsedData.gender === 'string' ? parsedData.gender.trim().toUpperCase() : '',
          address: typeof parsedData.address === 'string' ? parsedData.address.trim() : '',
          pincode: typeof parsedData.pincode === 'string' ? parsedData.pincode.trim() : '',
          documentNumber: typeof parsedData.documentNumber === 'string' ? parsedData.documentNumber.trim() : '',
          documentType: typeof parsedData.documentType === 'string' ? parsedData.documentType.trim() : '',
          confidence: sanitizedConfidence
        }
      });
    } catch {
      return res.status(200).json({
        success: false,
        error: 'Unable to parse document fields from model output. Manual entry is available.'
      });
    }
  } catch {
    // Sanitized error handling: do NOT leak keys or stack traces
    return res.status(200).json({
      success: false,
      error: 'Document extraction could not be completed. You can enter or edit the fields manually below.'
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SevaSetu Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
