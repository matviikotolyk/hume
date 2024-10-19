"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { useHumeClient } from "../_hooks/useHumeClient";
import Messages from "../_components/Messages";
import Controls from "../_components/Controls";

interface VoicePageProps {
  accessToken: string;
}

export default function VoicePage({ accessToken }: VoicePageProps) {
  const { humeClient, socket, isConnected, error } = useHumeClient();
  const apiKey = process.env.HUME_API_KEY;
  const configId = process.env.HUME_CONFIG_ID;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isConnected) {
    return <div>Error: Failed to connect to Hume</div>;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] p-8">
      <VoiceProvider
        auth={{ type: 'apiKey', value: apiKey! }}
        configId={configId}
      >
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Voice Session
          </h2>
          <Messages />
          <Controls />
        </div>
      </VoiceProvider>
    </div>
  );
}
