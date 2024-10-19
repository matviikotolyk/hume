"use client";

import React, { useState, useEffect } from "react";
import { VoiceProvider } from "@humeai/voice-react";
import ChatHistory from "./ChatHistory";
import Messages from "./Messages";
import Controls from "./Controls";

interface LandingPageProps {
  accessToken: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ accessToken }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] py-16">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle ${100}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 1), transparent 80%)`,
        }}
      />
      <h1 className="z-10 mb-8 text-4xl font-bold text-gray-800">
        Welcome to Your Mental Health Coach
      </h1>
      <div className="z-20 flex w-full flex-col items-center justify-center">
        <VoiceProvider
          auth={{ type: "accessToken", value: accessToken }}
          configId="a4f9ef27-e28e-470f-81f4-d815d0437195"
        >
          <Messages />
          <Controls />
        </VoiceProvider>
        <ChatHistory />
      </div>
    </div>
  );
};

export default LandingPage;
