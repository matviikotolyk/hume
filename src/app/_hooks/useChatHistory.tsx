import { useState, useEffect } from "react";
import { HumeClient } from "hume";

interface ReturnChat {
  chatGroupId: string;
  config: { id: string; version: number };
  endTimestamp: number;
  eventCount: number;
  id: string;
  metadata: any;
  startTimestamp: number;
  status: string;
  tag: string | null;
}

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ReturnChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChatHistory() {
      setIsLoading(true);
      try {
        const client = new HumeClient({
          apiKey: process.env.NEXT_PUBLIC_HUME_API_KEY,
        });
        const response = await client.empathicVoice.chats.listChats({
          pageNumber: 0,
          pageSize: 10,
          ascendingOrder: true,
        });

        if (Array.isArray(response.data)) {
          setChatHistory(response.data as ReturnChat[]);
        } else {
          console.warn("Unexpected response structure:", response);
          setChatHistory([]);
        }

        if (response.data && response.data.length > 0) {
          const chagGroupId = response.data[0]?.chatGroupId ?? "";
          const events =
            await client.empathicVoice.chatGroups.listChatGroupEvents(
              chagGroupId,
              {
                pageNumber: 0,
                pageSize: 10,
                ascendingOrder: true,
              },
            );
          console.log({ events });
        }

        console.log("Chat History Response:", response);
      } catch (err) {
        console.error("Error fetching chat history:", err);
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchChatHistory();
  }, []);

  return { chatHistory, isLoading, error };
}
