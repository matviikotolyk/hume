import React, { useEffect, useState, useRef } from "react";
import { useVoice } from "@humeai/voice-react";
import { ScrollArea, Card, Flex, Text, Box, Badge } from "@radix-ui/themes";
import { UploadedFile } from "./LandingPage";

interface MessageProps {
  selectedFile: UploadedFile | null;
}

export default function Messages({ selectedFile }: MessageProps) {
  interface EmotionScores extends Record<string, number> {}

  const { messages, resumeAssistant, pauseAssistant } = useVoice();
  const [contextSent, setContextSent] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  type RadixColor =
    | "blue"
    | "green"
    | "violet"
    | "yellow"
    | "orange"
    | "red"
    | "pink"
    | "indigo"
    | "cyan"
    | "crimson"
    | "gray";

  const getBadgeColor = (prosodyType: string): RadixColor => {
    const colorMap: Record<string, RadixColor> = {
      interest: "blue",
      excitement: "green",
      calmness: "violet",
      joy: "yellow",
      satisfaction: "orange",
      contentment: "cyan",
      amusement: "pink",
      pride: "indigo",
      love: "crimson",
      relief: "red",
    };
    return colorMap[prosodyType] ?? "gray";
  };

  const getTopProsodyScores = (scores: EmotionScores | {}) => {
    return Object.entries(scores as { [key: string]: number })
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score: score.toFixed(2),
      }));
  };

  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && shouldAutoScroll) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(scrollToBottom, 500); // Check every half second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [shouldAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const isNearBottom =
        scrollArea.scrollHeight - scrollArea.scrollTop <=
        scrollArea.clientHeight + 100; // 100px threshold
      setShouldAutoScroll(isNearBottom);
    }
  };

  return (
    <Box className="rounded-md bg-[#F5F5F5] p-4">
      <ScrollArea
        type="always"
        scrollbars="vertical"
        style={{ height: "400px" }}
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <Flex direction="column" gap="3">
          {messages.length === 0 && (
            <Text weight={"light"}>
              Select a journal entry if you want to chat about it or simply
              click Start Conversation if you want to chat with EVI or do a
              guided meditation session.
            </Text>
          )}
          {messages.map((msg, index) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              const isUser = msg.type === "user_message";
              const topScores = getTopProsodyScores(
                msg.models?.prosody?.scores ?? {},
              );
              return (
                <Card
                  key={msg.type + index}
                  style={{
                    backgroundColor: isUser ? "#FED8B1" : "#FCCAC4",
                    marginBottom: "8px",
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Text weight="bold" style={{ color: "#4A2B0F" }}>
                      {isUser ? "User" : "Assistant"}
                    </Text>
                    <Text style={{ color: "#3D2409" }}>
                      {msg.message.content}
                    </Text>
                    <Flex gap="2">
                      {topScores.map(({ type, score }) => (
                        <Badge
                          key={type}
                          color={getBadgeColor(type)}
                          variant="solid"
                        >
                          {`${type}: ${score}`}
                        </Badge>
                      ))}
                    </Flex>
                  </Flex>
                </Card>
              );
            }
            return null;
          })}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
