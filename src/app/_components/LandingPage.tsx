"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VoiceProvider } from "@humeai/voice-react";
import { useDropzone } from "react-dropzone";
import ChatHistory from "./ChatHistory";
import Messages from "./Messages";
import Controls from "./Controls";
import Groq from "groq-sdk";

interface LandingPageProps {
  accessToken: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ accessToken }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    const file = acceptedFiles[0];
    if (file?.type === "application/pdf") {
      try {
        const text = await extractTextFromPDF(file);
        const analysis = await analyzeTextWithGroq(text);
        setPdfContent(analysis);
      } catch (error) {
        console.error("Error processing PDF:", error);
        // Handle error (e.g., show error message to user)
      }
    } else {
      // Handle non-PDF file
      console.error("Please upload a PDF file");
    }
    setIsLoading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop }); //eslint-disable-line @typescript-eslint/no-misused-promises

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Implement PDF text extraction here
    // For this example, we'll just return the file name as a placeholder
    return `Content of ${file.name}`;
  };

  const analyzeTextWithGroq = async (text: string): Promise<string> => {
    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI trained to analyze journal entries for emotional sentiment. Provide a brief summary of the emotional state conveyed in the text.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama3-8b-8192",
    });
    return chatCompletion.choices[0]?.message?.content ?? "";
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] py-16">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle ${100}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 1), transparent 80%)`,
        }}
      />
      <h1 className="z-10 mb-8 text-4xl font-bold text-gray-800">
        Welcome to Your Mental Health Coach
      </h1>
      <div className="z-20 flex w-full flex-col items-center justify-center">
        <div
          {...getRootProps()}
          className="mb-4 cursor-pointer rounded border-2 border-dashed border-gray-300 p-4 text-center"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the PDF file here ...</p>
          ) : (
            <p>
              Drag &apos;n&apos; drop a PDF file here, or click to select a file
            </p>
          )}
        </div>
        {isLoading && <p>Processing your journal entry...</p>}
        <VoiceProvider
          auth={{ type: "accessToken", value: accessToken }}
          configId="a4f9ef27-e28e-470f-81f4-d815d0437195"
        >
          <Messages pdfContent={pdfContent} />
          <Controls />
        </VoiceProvider>
        <ChatHistory />
      </div>
    </div>
  );
};

export default LandingPage;
