"use client";

import React, { useState, useEffect } from "react";
import { VoiceProvider } from "@humeai/voice-react";
import ChatHistory from "./ChatHistory";
import Messages from "./Messages";
import Controls from "./Controls";
import FileUpload from "./FileUpload";
import FileManager from "./FileManager";
import SearchResults from "./SearchResults";
import Groq from "groq-sdk";
import { Box, Flex } from "@radix-ui/themes";

interface LandingPageProps {
  accessToken: string;
}

export interface UploadedFile {
  name: string;
  content: string;
  analysis: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ accessToken }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const analyzeTextWithGroq = async (text: string): Promise<string> => {
    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const chunkSize = 4000;
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    let fullAnalysis = "";

    for (const chunk of chunks) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an AI trained to analyze journal entries for emotional sentiment. Provide a brief summary of the emotional state conveyed in the text.",
          },
          {
            role: "user",
            content: chunk,
          },
        ],
        model: "llama-3.1-70b-versatile",
        max_tokens: 1000,
      });

      const analysisChunk = chatCompletion.choices[0]?.message?.content ?? "";
      fullAnalysis += analysisChunk;

      console.log("Llama model output:", analysisChunk);
    }

    return fullAnalysis;
  };

  const handleFileProcessed = async (name: string, content: string) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeTextWithGroq(content);
      const newFile = { name, content, analysis };
      setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
      setSelectedFile(newFile);
    } catch (error) {
      console.error("Error analyzing text:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] py-16">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle ${100}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 1), transparent 80%) z-0`,
        }}
      />
      <h1 className="z-10 mb-8 text-center text-4xl font-bold text-[#353535]">
        Welcome to Your Mental Health Coach
      </h1>
      <Flex className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Box className="w-1/4 pr-8">
          <Box className="mb-4 rounded-md border border-gray-300 bg-[#F5F5F5] p-4">
            <FileUpload onFileProcessed={handleFileProcessed} />
            {isLoading && (
              <p className="mt-2 text-white">Analyzing your journal entry...</p>
            )}
          </Box>
          <Box className="h-[calc(100vh-400px)] overflow-y-auto">
            <FileManager
              uploadedFiles={uploadedFiles}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </Box>
        </Box>
        <Box className="w-2/4 px-8">
          <VoiceProvider
            auth={{ type: "accessToken", value: accessToken }}
            configId="a4f9ef27-e28e-470f-81f4-d815d0437195"
          >
            <Box className="mb-4 h-[calc(100vh-300px)] rounded-md border border-gray-300 bg-[#F5F5F5] p-4">
              <Messages selectedFile={selectedFile} />
            </Box>
            <Box className="rounded-md bg-transparent">
              <Controls
                selectedFile={selectedFile}
                onSearchResults={setSearchResults}
              />
            </Box>
          </VoiceProvider>
        </Box>
        <Box className="w-1/4 pl-8">
          <SearchResults results={searchResults} />
        </Box>
      </Flex>
      <Box className="mt-8 w-full justify-center">
        <ChatHistory />
      </Box>
    </div>
  );
};

export default LandingPage;
