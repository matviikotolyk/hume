import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import type { File } from "formidable";
import fs from "fs/promises";
import * as pdfjsLib from "pdfjs-dist";

// Types
type FormParseResult = {
  fields: formidable.Fields;
  files: formidable.Files;
};

type ApiResponse = {
  text?: string;
  error?: string;
};

// Define proper types for PDF.js content
interface PDFTextContent {
  items: PDFTextItem[];
}

interface PDFTextItem {
  str: string;
  // Add other properties if needed
  dir: string;
  transform: number[];
  width: number;
  height: number;
}

// Configuration for Next.js API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper functions
const parseForm = (req: NextApiRequest): Promise<FormParseResult> => {
  const form = formidable();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      resolve({ fields, files });
    });
  });
};

const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  const pdfDocument = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

  let text = "";
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = (await page.getTextContent()) as PDFTextContent;
    const pageText = content.items
      .map((item: PDFTextItem) => item.str)
      .join(" ");
    text += pageText + " ";
  }

  return text.trim();
};

// Main handler
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
): Promise<void> => {
  // Method validation
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    // Parse form data
    const { files } = await parseForm(req);
    const uploadedFile = Object.values(files || {})[0] as File | undefined;

    if (!uploadedFile) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Extract text from PDF
    const text = await extractTextFromPDF(uploadedFile.filepath);

    // Clean up the temporary file
    await fs.unlink(uploadedFile.filepath).catch((err) => {
      console.error("Error deleting temporary file:", err);
    });

    res.status(200).json({ text });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export default handler;
