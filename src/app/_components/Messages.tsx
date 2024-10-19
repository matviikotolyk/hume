import React from "react";
import { useVoice } from "@humeai/voice-react";
import { ScrollArea, Card, Flex, Text, Box } from "@radix-ui/themes";

export default function Messages() {
  const { messages } = useVoice();

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
            <Text>Press "Start Conversation" to talk to EVI</Text>
          )}
          {messages.map((msg, index) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              const isUser = msg.type === "user_message";
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
