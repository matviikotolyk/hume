"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { VoiceProvider } from "@humeai/voice-react";
// import ChatHistory from "./ChatHistory";
import Messages from "./Messages";
import Controls from "./Controls";
import FileUpload from "./FileUpload";
import FileManager from "./FileManager";
import SearchResults from "./SearchResults";
import WelcomeModal from "./WelcomeModal";
import Groq from "groq-sdk";
import { Box, Flex, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

interface SearchResult {
  title: string;
  summary: string;
  url: string;
}

interface LandingPageProps {
  accessToken: string;
}

export interface UploadedFile {
  id?: string;
  name: string;
  content: string;
  analysis: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ accessToken }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [showModal, setShowModal] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.localStorage.getItem("welcomeModal");
    }
    return false;
  });

  useEffect(() => {
    if (!showModal) {
      window.localStorage.setItem("welcomeModal", "true");
    }
  }, [showModal]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setUploadedFiles(data || []);
      }
    };

    fetchFiles().catch((error) => {
      console.error("Error fetching files: ", error);
      setIsLoading(false);
    });
  }, [supabase]);

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
              "You are an AI trained to analyze journal entries for emotional sentiment. Provide a brief summary of the emotional state conveyed in the text. Pay attention to details and come up with a complete and accurate summary.",
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

      // console.log("Llama model output:", analysisChunk);
    }

    return fullAnalysis;
  };

  const handleFileProcessed = async (name: string, content: string) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const analysis = await analyzeTextWithGroq(content);

      // Store the file in Supabase
      const { data, error }: { data: { id: string } | null; error: unknown } =
        await supabase
          .from("uploaded_files")
          .insert({
            user_id: user.id,
            name,
            content,
            analysis,
          })
          .select()
          .single();

      if (error || !data) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "An error occurred while storing the file.",
        );
      }

      const newFile: UploadedFile = { id: data.id, name, content, analysis };
      setUploadedFiles((prevFiles) => [newFile, ...prevFiles]);
      setSelectedFile(newFile);
    } catch (error) {
      console.error("Error processing file:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] p-4 sm:py-16">
      {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `
              radial-gradient(
                circle 180px at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(255, 255, 255, 0.7) 0%,
                rgba(255, 220, 255, 0.4) 20%,
                rgba(255, 200, 255, 0.2) 40%,
                transparent 65%
              ),
              radial-gradient(
                circle 120px at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(255, 182, 193, 0.5) 0%,
                rgba(255, 182, 193, 0.2) 30%,
                transparent 60%
              )
            `,
          mixBlendMode: "soft-light",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <Flex
          justify="center"
          align="center"
          className="flex-col gap-4 sm:flex-row"
        >
          <h1 className="text-center text-2xl font-bold text-[#353535] sm:text-4xl">
            Welcome to Your Mental Health Coach
          </h1>
          <Button onClick={handleSignOut} className="hover:cursor-pointer">
            Sign Out
          </Button>
        </Flex>

        {/* Main content as a column on mobile */}
        <Flex className="mx-auto w-full max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
          {/* File Upload Section */}
          <Box className="flex w-full flex-col gap-4 lg:w-1/4">
            <Box className="rounded-md border border-gray-300 bg-[#F5F5F5] p-4">
              <FileUpload onFileProcessed={handleFileProcessed} />
              {isLoading && (
                <p className="mt-2 text-blue-500">
                  Analyzing your journal entry...
                </p>
              )}
            </Box>

            {/* File Manager with adaptive height */}
            <Box className="h-[300px] overflow-y-auto rounded-md bg-transparent lg:h-[calc(100vh-400px)]">
              <FileManager
                uploadedFiles={uploadedFiles}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            </Box>
          </Box>

          {/* Messages and Controls Section */}
          <Box className="flex w-full flex-col gap-4 lg:w-2/4">
            <VoiceProvider
              auth={{ type: "accessToken", value: accessToken }}
              configId="a4f9ef27-e28e-470f-81f4-d815d0437195"
            >
              <Box className="h-[400px] rounded-md border border-gray-300 bg-[#F5F5F5] lg:h-[calc(100vh-300px)]">
                <Messages selectedFile={selectedFile} />
              </Box>
              <Box className="rounded-md bg-transparent py-4">
                <Controls
                  selectedFile={selectedFile}
                  onSearchResults={setSearchResults}
                />
              </Box>
            </VoiceProvider>
          </Box>

          {/* Search Results Section */}
          <Box className="w-full lg:w-1/4">
            <Box className="h-[300px] overflow-y-auto rounded-md">
              <SearchResults results={searchResults} />
            </Box>
          </Box>
        </Flex>
      </div>
    </div>
  );
};

export default LandingPage;
