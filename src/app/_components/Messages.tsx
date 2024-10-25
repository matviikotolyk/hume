import React, { useEffect, useState, useRef } from "react";
import { useVoice } from "@humeai/voice-react";
import { ScrollArea, Card, Flex, Text, Box, Badge } from "@radix-ui/themes";
import type { UploadedFile } from "./LandingPage";

// Types
interface MessageProps {
  selectedFile: UploadedFile | null;
}

interface EmotionScore {
  type: string;
  score: string;
}

interface ProsodyScores {
  scores?: Record<string, number>;
}

interface MessageModels {
  prosody?: ProsodyScores;
}

interface Message {
  type: "user_message" | "assistant_message";
  message: {
    content: string;
  };
  models?: MessageModels;
}

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

// Color mapping
const PROSODY_COLORS: Record<string, RadixColor> = {
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
} as const;

export default function Messages({
  selectedFile: _,
}: MessageProps): JSX.Element {
  const { messages } = useVoice();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getBadgeColor = (prosodyType: string): RadixColor => {
    return PROSODY_COLORS[prosodyType] ?? "gray";
  };

  const getTopProsodyScores = (
    scores: ProsodyScores["scores"] = {},
  ): EmotionScore[] => {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score: score.toFixed(2),
      }));
  };

  const scrollToBottom = (): void => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && shouldAutoScroll) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(scrollToBottom, 500);
    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    scrollToBottom();
  });

  const handleScroll = (): void => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const isNearBottom =
        scrollArea.scrollHeight - scrollArea.scrollTop <=
        scrollArea.clientHeight + 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const renderMessage = (msg: Message, index: number): JSX.Element | null => {
    if (msg.type !== "user_message" && msg.type !== "assistant_message") {
      return null;
    }

    const isUser = msg.type === "user_message";
    const topScores = getTopProsodyScores(msg.models?.prosody?.scores);

    return (
      <Card
        key={`${msg.type}-${index}`}
        style={{
          backgroundColor: isUser ? "#FED8B1" : "#FCCAC4",
          marginBottom: "8px",
        }}
      >
        <Flex direction="column" gap="2">
          <Text weight="bold" style={{ color: "#4A2B0F" }}>
            {isUser ? "User" : "Assistant"}
          </Text>
          <Text style={{ color: "#3D2409" }}>{msg.message.content}</Text>
          <Flex gap="2">
            {topScores.map(({ type, score }) => (
              <Badge key={type} color={getBadgeColor(type)} variant="solid">
                {`${type}: ${score}`}
              </Badge>
            ))}
          </Flex>
        </Flex>
      </Card>
    );
  };

  return (
    <Box className="rounded-md bg-[#F5F5F5] p-2 md:p-4">
      <ScrollArea
        type="always"
        scrollbars="vertical"
        style={{
          height: "auto",
          maxHeight: window.innerWidth < 768 ? "300px" : "460px",
        }}
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <Flex direction="column" gap="3">
          {messages.length === 0 ? (
            <Text weight="light">
              Select a journal entry if you want to chat about it or simply
              click <strong>Start Conversation</strong> if you want to chat with
              EVI or do a guided meditation session.
            </Text>
          ) : (
            messages.map((msg, index) => renderMessage(msg as Message, index))
          )}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
