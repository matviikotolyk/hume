import React from "react";
import { useChatHistory } from "../_hooks/useChatHistory";
import {
  ScrollArea,
  Card,
  Flex,
  Text,
  Box,
  Heading,
} from "@radix-ui/themes";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ChatHistory() {
  const { chatHistory, isLoading, error } = useChatHistory();
//   const supabase = createClientComponentClient();

  if (isLoading) return <Text>Loading chat history...</Text>;
  if (error) return <Text color="red">Error: {error}</Text>;

  return (
    <Box className="w-full rounded-md border border-gray-300 bg-[#FED8B1]/10 p-2 text-white">
      <Flex justify="between" align="center" mb="2">
        <Heading size="4" className="text-[#353535]">
          Chat History
        </Heading>
      </Flex>
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
                  Created at: {new Date(chat.start_timestamp).toLocaleString()}
                </Text>
                <Text style={{ color: "#3D2409" }}>Status: {chat.status}</Text>
                <Text style={{ color: "#3D2409" }}>
                  Event Count: {chat.event_count}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
