import React, { useEffect } from "react";
import { useVoice } from "@humeai/voice-react";
import { ScrollArea, Card, Flex, Text, Box, Badge } from "@radix-ui/themes";

interface MessageProps {
  pdfContent: string | null;
}

export default function Messages({ pdfContent }: MessageProps) {
  useEffect(() => {
    if (pdfContent) {
      console.log("pdfContent", pdfContent);
    }
  });
  interface EmotionScores extends Record<string, number> {} //eslint-disable-line @typescript-eslint/no-empty-object-type

  const { messages, resumeAssistant, pauseAssistant } = useVoice();

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
      // Add more mappings as needed
    };
    return colorMap[prosodyType] ?? "gray";
  };

  const getTopProsodyScores = (scores: EmotionScores | {}) => { //eslint-disable-line @typescript-eslint/no-empty-object-type
    return Object.entries(scores as { [key: string]: number }) //eslint-disable-line @typescript-eslint/consistent-indexed-object-style
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score: score.toFixed(2),
      }));
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === "assistant_message") {
      pauseAssistant();
      setTimeout(() => {
        resumeAssistant();
      }, 10000);
    }
  }, [messages, pauseAssistant, resumeAssistant]);

  return (
    <Box className="w-1/2 rounded-md border border-[#FCCAC4] bg-white p-4">
      <ScrollArea
        type="always"
        scrollbars="vertical"
        autoFocus
        style={{ height: "400px" }}
      >
        <Flex direction="column" gap="3">
          {messages.length === 0 && (
            <Text>Press &apos;Start Conversation&apos; to talk to EVI</Text>
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
