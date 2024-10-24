import React, { useState, useEffect, useCallback } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Button, Flex } from "@radix-ui/themes";
import { Mic, MicOff, Send, Search } from "lucide-react";
import Groq from "groq-sdk";

// Types
interface SearchResult {
  title: string;
  summary: string;
  url: string;
}

interface SelectedFile {
  name: string;
  content: string;
  analysis: string;
}

interface ControlsProps {
  selectedFile: SelectedFile | null;
  onSearchResults: (results: SearchResult[]) => void;
}

interface GoogleSearchItem {
  title: string;
  snippet: string;
  link: string;
}

interface GoogleSearchResponse {
  items: GoogleSearchItem[];
}

// Helper functions
const performGoogleSearch = async (query: string): Promise<SearchResult[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error("Missing Google Search API configuration");
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as GoogleSearchResponse;

    return data.items.slice(0, 3).map((item) => ({
      title: item.title,
      summary: item.snippet,
      url: item.link,
    }));
  } catch (error) {
    console.error("Error performing Google search:", error);
    throw error;
  }
};

export default function Controls({
  selectedFile,
  onSearchResults,
}: ControlsProps): JSX.Element {
  const {
    connect,
    disconnect,
    isMuted,
    mute,
    unmute,
    readyState,
    sendSessionSettings,
    messages,
  } = useVoice();

  const [error, setError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const setSystemPrompt = useCallback(() => {
    if (!selectedFile) {
      console.log("No file selected, using default system prompt");
      return;
    }

    sendSessionSettings({
      systemPrompt: `You are an AI trained to provide mental health support. 
      The user has shared a journal entry, and here's the analysis of their emotional state:
      {{analysis}}
      Keep this context in mind during the conversation and provide empathetic and supportive responses. Make sure to mention that you are aware of the journal entry and the person's emotional state. Go over the overall vibe of the journal entry and ask the user to explain more if they want to.`,
      variables: {
        analysis: selectedFile.analysis,
      },
    });
    console.log("System prompt set with journal entry analysis.");
  }, [selectedFile, sendSessionSettings]);

  useEffect(() => {
    if (readyState === VoiceReadyState.OPEN) {
      setSystemPrompt();
    }
  }, [readyState, setSystemPrompt]);

  const handleConnect = async (): Promise<void> => {
    setIsConnecting(true);
    try {
      await connect();
      setError("");
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSearch = async (): Promise<void> => {
    setIsSearching(true);
    const lastAssistantMessage = messages
      .filter((msg) => msg.type === "assistant_message")
      .pop();

    if (!lastAssistantMessage) {
      setError("No assistant message found to search for.");
      setIsSearching(false);
      return;
    }

    const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!groqApiKey) {
      setError("Missing Groq API configuration");
      setIsSearching(false);
      return;
    }

    const groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates search queries based on conversation context. When needed, you add all the relevant context like location, time, etc. to the search query.",
          },
          {
            role: "user",
            content: `Generate a search query helpful for a user to discover more based on this message: "${lastAssistantMessage.message.content}"`,
          },
        ],
        model: "llama3-groq-70b-8192-tool-use-preview",
        tools: [
          {
            type: "function",
            function: {
              name: "search_web",
              description: "Search the web for information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query",
                  },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });

      const toolCalls = chatCompletion.choices[0]?.message?.tool_calls;
      let searchQuery = "";

      if (toolCalls && toolCalls.length > 0) {
        const args = toolCalls[0]?.function?.arguments;
        if (args) {
          const parsedArgs = JSON.parse(args) as { query: string };
          searchQuery = parsedArgs.query;
        }
      } else {
        searchQuery = chatCompletion.choices[0]?.message?.content ?? "";
        searchQuery = searchQuery.replace(/^["'](.*)["']$/, "$1");
      }

      if (searchQuery) {
        const searchResults = await performGoogleSearch(searchQuery);
        onSearchResults(searchResults);
      } else {
        setError("Generated search query is empty.");
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setError("Failed to perform search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      {readyState === VoiceReadyState.OPEN ? (
        <div className="grid grid-cols-2 gap-4 py-2 lg:flex-row">
          <Button
            onClick={isMuted ? unmute : mute}
            variant="surface"
            color={isMuted ? "gray" : "ruby"}
            className="text-white hover:cursor-pointer"
          >
            {isMuted ? (
              <Mic className="mr-2 h-4 w-4" />
            ) : (
              <MicOff className="mr-2 h-4 w-4" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            onClick={disconnect}
            variant="solid"
            color="ruby"
            className="text-white hover:cursor-pointer"
          >
            End Conversation
          </Button>

          <Button
            onClick={setSystemPrompt}
            variant="solid"
            color="orange"
            className="text-white hover:cursor-pointer"
            disabled={!selectedFile}
          >
            <Send className="mr-2 h-4 w-4" /> Update Prompt
          </Button>

          <Button
            onClick={handleSearch}
            variant="solid"
            className="text-white hover:cursor-pointer"
            disabled={isSearching}
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Web Search"}
          </Button>
        </div>
      ) : (
        <Flex gap="2">
          <Button
            onClick={handleConnect}
            variant="solid"
            color="iris"
            className="text-white hover:cursor-pointer"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Start Conversation"}
          </Button>
        </Flex>
      )}

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
