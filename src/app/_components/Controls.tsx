import React, { useState } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Button } from "@radix-ui/themes";
import { Mic, MicOff } from "lucide-react";
export default function Controls() {
  const { connect, disconnect, isMuted, mute, unmute, readyState } = useVoice();
  const [error, setError] = useState("");

  const handleConnect = () => {
    connect()
      .then(() => {
        setError("");
      })
      .catch((_err) => {
        setError("Failed to connect. Please try again.");
      });
  };

  return (
    <div className="flex flex-row items-center gap-4 py-8">
      {readyState === VoiceReadyState.OPEN ? (
        <>
          {!isMuted ? (
            <Button
              onClick={mute}
              variant="surface"
              className="bg-[#FCCAC4] text-[#4A2B0F] hover:cursor-pointer hover:bg-[#FBA69F]"
            >
              <MicOff className="mr-2 h-4 w-4" /> Mute
            </Button>
          ) : (
            <Button
              onClick={unmute}
              variant="surface"
              className="bg-[#FCCAC4] text-[#4A2B0F] hover:cursor-pointer hover:bg-[#FBA69F]"
            >
              <Mic className="mr-2 h-4 w-4" /> Unmute
            </Button>
          )}
          <Button
            onClick={disconnect}
            variant="solid"
            className="bg-[#FCCAC4] text-[#4A2B0F] hover:cursor-pointer hover:bg-[#FBA69F]"
          >
            End Conversation
          </Button>
        </>
      ) : (
        <Button
          onClick={handleConnect}
          variant="outline"
          className="bg-[#FED8B1] text-[#4A2B0F] hover:cursor-pointer hover:bg-[#FDCB9B]"
        >
          Start Conversation
        </Button>
      )}

      {error && <div>error</div>}
    </div>
  );
}
