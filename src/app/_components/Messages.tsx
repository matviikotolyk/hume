"use client";
import { useVoice } from "@humeai/voice-react";
import { ScrollArea } from "@radix-ui/themes";

export default function Messages() {
  const { messages } = useVoice();

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border border-gray-200 p-4">
      {messages.map((msg, index) => {
        if (msg.type === "user_message" || msg.type === "assistant_message") {
          const isUser = msg.message.role === "user";
          return (
            <div key={msg.type + index} className={`mb-4 ${isUser ? "text-right" : "text-left"}`}>
              <div className="mb-1 text-sm font-semibold text-gray-600">
                {isUser ? "You" : "Assistant"}
              </div>
              <div
                className={`inline-block rounded-lg p-3 ${
                  isUser ? "bg-[#FDD2C5]" : "bg-[#FED8B1]"
                } text-gray-800`}
              >
                {msg.message.content}
              </div>
            </div>
          );
        }
        return null;
      })}
    </ScrollArea>
  );
}