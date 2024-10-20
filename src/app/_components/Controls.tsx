import React, { useState, useEffect } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Button, Flex } from "@radix-ui/themes";
import { Mic, MicOff, Send, Search } from "lucide-react";
import Groq from "groq-sdk";

interface ControlsProps {
  selectedFile: {
    name: string;
    content: string;
    analysis: string;
  } | null;
  onSearchResults: (results: any) => void;
}

export default function Controls({
  selectedFile,
  onSearchResults,
}: ControlsProps) {
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
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    connect()
      .then(() => {
        setError("");
        setIsConnecting(false);
      })
      .catch((_err) => {
        setError("Failed to connect. Please try again.");
        setIsConnecting(false);
      });
  };

  const setSystemPrompt = () => {
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
  };

  useEffect(() => {
    if (readyState === VoiceReadyState.OPEN) {
      setSystemPrompt();
    }
  }, [readyState, selectedFile]);

  const performGoogleSearch = async (query: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items.slice(0, 3).map((item: any) => ({
        title: item.title,
        summary: item.snippet,
        url: item.link,
      }));
    } catch (error) {
      console.error("Error performing Google search:", error);
      throw error;
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const lastAssistantMessage = messages
      .filter((msg) => msg.type === "assistant_message")
      .pop();

    console.log("Last assistant message:", lastAssistantMessage);

    if (!lastAssistantMessage) {
      setError("No assistant message found to search for.");
      setIsSearching(false);
      return;
    }

    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    try {
      console.log("Sending request to Groq API...");
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

      console.log("Groq API response:", chatCompletion);

      let searchQuery = "";

      const toolCalls = chatCompletion.choices[0]?.message?.tool_calls;
      console.log("Tool calls:", toolCalls);

      if (toolCalls && toolCalls.length > 0) {
        searchQuery = JSON.parse(
          toolCalls[0]?.function?.arguments ?? "{}",
        ).query;
      } else {
        // If no tool calls, use the message content as the search query
        searchQuery = chatCompletion.choices[0]?.message?.content ?? "";
        // Remove quotes if present
        searchQuery = searchQuery.replace(/^["'](.*)["']$/, "$1");
      }

      console.log("Generated search query:", searchQuery);

      if (searchQuery) {
        const searchResults = await performGoogleSearch(searchQuery);
        console.log("Search results:", searchResults);
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
    <div className="flex flex-row gap-4 py-2">
      {readyState === VoiceReadyState.OPEN ? (
        <>
          {!isMuted ? (
            <Button
              onClick={mute}
              variant="surface"
              color="ruby"
              className="text-white hover:cursor-pointer"
            >
              <MicOff className="mr-2 h-4 w-4" /> Mute
            </Button>
          ) : (
            <Button
              onClick={unmute}
              variant="surface"
              className="text-white hover:cursor-pointer"
            >
              <Mic className="mr-2 h-4 w-4" /> Unmute
            </Button>
          )}
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
            <Search className="mr-2 h-4 w-4" />{" "}
            {isSearching ? "Searching..." : "Web Search"}
          </Button>
        </>
      ) : (
        <Flex gap="2">
          <Button
            onClick={handleConnect}
            variant="solid"
            color="gray"
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
