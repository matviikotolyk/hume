import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-fade-in fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-content-show fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-gradient-to-br from-[#FCCAC4] to-[#FED8B1] p-8 shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] focus:outline-none">
          <Dialog.Title className="mb-6 text-2xl font-bold text-[#353535]">
            Welcome to Your Journey
          </Dialog.Title>

          <div className="relative overflow-hidden rounded-lg bg-white/80 p-6 backdrop-blur-sm">
            <div className="space-y-6 text-[#353535]">
              <p className="text-lg font-semibold">
                Welcome to Your Mental Health Coach! 🌟
              </p>

              <p>
                We're here to support your emotional wellbeing in two powerful
                ways:
              </p>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold">1. Guided Meditation Sessions</p>
                  <p className="ml-4 mt-1">
                    Our AI companion EVI will help you through personalized
                    meditation sessions, tailored to your current emotional
                    state and needs.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    2. Journal Analysis & Conversation
                  </p>
                  <p className="ml-4 mt-1">
                    Share your thoughts through journal entries, and we'll
                    provide emotional insights while engaging in meaningful
                    conversations about your wellbeing.
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold">Additional Features:</p>
                <ul className="ml-4 mt-2 space-y-1">
                  <li>• Smart Web Search for wellness tips and resources</li>
                  <li>• Emotional state tracking and analysis</li>
                  <li>• Personalized wellness recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Dialog.Close asChild>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-[#fdbdb6] to-[#f3b373] px-6 py-2 text-[#353535] outline-none transition-all hover:from-[#FBB5AC] hover:to-[#FECF9A]"
              >
                Let's Begin
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 inline-flex size-[25px] items-center justify-center rounded-full text-[#353535] hover:bg-white/20 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WelcomeModal;
