import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ChatHistoryItem {
  id: string;
  user_id: string;
  chat_group_id: string;
  start_timestamp: number;
  end_timestamp: number | null;
  event_count: number;
  status: string;
  tag: string | null;
}

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchChatHistory() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("*")
          .order("start_timestamp", { ascending: false })
          .limit(10);

        if (error) throw error;

        setChatHistory(data || []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchChatHistory();
  }, [supabase]);

  return { chatHistory, isLoading, error };
}
