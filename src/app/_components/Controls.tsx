"use client";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Button } from "@radix-ui/themes";
import { useState } from "react";

export default function Controls() {
  const { connect, disconnect, readyState } = useVoice();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    connect()
      .then(() => {
        setError(null);
      })
      .catch((err) => {
        setError("Failed to connect. Please try again.");
        console.error(err);
      });
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
  };

  if (readyState === VoiceReadyState.OPEN) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-red-500 text-white hover:bg-red-600"
      >
        End Session
      </Button>
    );
  }

  return (
    <div>
      <Button
        onClick={handleConnect}
        className="bg-[#FDD2C5] text-gray-800 hover:bg-[#FCC3B4]"
      >
        Start Session
      </Button>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  );
}
