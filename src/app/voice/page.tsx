"use client";
import { VoiceProvider } from "@humeai/voice-react";
import Messages from "../_components/Messages";
import Controls from "../_components/Controls";

export default function VoiceAgent({ accessToken }: { accessToken: string }) {
  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId="a4f9ef27-e28e-470f-81f4-d815d0437195"
    >
      <Messages />
      <Controls />
    </VoiceProvider>
  );
}
