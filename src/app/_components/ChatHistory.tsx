import React from "react";
import { useChatHistory } from "../_hooks/useChatHistory";
import { ScrollArea, Card, Flex, Text, Box, Heading } from "@radix-ui/themes";

export default function ChatHistory() {
  const { chatHistory, isLoading, error } = useChatHistory();

  if (isLoading) return <Text>Loading chat history...</Text>;
  if (error) return <Text color="red">Error: {error}</Text>;

  return (
    <Box className="w-1/2 rounded-md border border-gray-300 bg-[#FED8B1]/10 p-2 text-white">
      <Heading size="4" className="text-[#353535]" mb="2">
        Chat History
      </Heading>
      <ScrollArea
        type="always"
        scrollbars="vertical"
        style={{ height: "200px" }}
      >
        <Flex direction="column" gap="3">
          {chatHistory?.map((chat) => (
            <Card
              key={chat.id}
              style={{
                backgroundColor: "#FCCAC4",
                marginBottom: "8px",
              }}
            >
              <Flex direction="column" gap="2">
                <Text weight="bold" style={{ color: "#4A2B0F" }}>
                  Chat ID: {chat.id}
                </Text>
                <Text style={{ color: "#3D2409" }}>
                  Created at: {new Date(chat.startTimestamp).toLocaleString()}
                </Text>
                {/* Add more chat details here as needed */}
              </Flex>
            </Card>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
