"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Flex, Text, TextField, Button, Heading } from "@radix-ui/themes";
import * as Toast from "@radix-ui/react-toast";

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser().catch((error) => {
      console.error("Error fetching user: ", error);
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [supabase.auth]);

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      showToast(error.message, "error");
    } else if (data.user?.identities?.length === 0) {
      showToast(
        "This email is already registered. Please sign in instead.",
        "error",
      );
    } else {
      showToast("Check your email for the confirmation link!", "success");
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Signed in successfully!", "success");
      router.push("/"); // Redirect to landing page after successful sign in
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    showToast("Signed out successfully!", "success");
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <div className="relative min-h-screen bg-gradient-to-t from-[#FED8B1] to-[#FCCAC4] py-16">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle ${100}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 1), transparent 80%) z-0`,
        }}
      />
      <Box className="z-10 mx-auto max-w-md">
        <Heading size="8" className="mb-8 text-center text-[#353535]">
          Mental Health Coach
        </Heading>
        <Box className="rounded-md border border-gray-300 bg-[#F5F5F5] p-6">
          {user ? (
            <Flex direction="column" gap="3">
              <Text>Welcome, {user.email}!</Text>
              <Button onClick={handleSignOut}>Sign Out</Button>
              <Link className="w-full" href="/">
                <Button className="hover:cursor-pointer" color="orange">
                  Go To Home Page
                </Button>
              </Link>
            </Flex>
          ) : (
            <Flex direction="column" gap="3">
              <TextField.Root
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField.Root
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleSignIn} className="hover:cursor-pointer">
                Sign In
              </Button>
              <Button
                onClick={handleSignUp}
                className="hover:cursor-pointer"
                variant="soft"
              >
                Sign Up
              </Button>
            </Flex>
          )}
        </Box>
      </Box>
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className="data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-md bg-white p-[15px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={3000}
        >
          <Toast.Title
            className={`mb-[5px] text-[15px] font-medium ${toastType === "success" ? "text-green-600" : "text-red-600"} [grid-area:_title]`}
          >
            {toastType === "success" ? "Success" : "Error"}
          </Toast.Title>
          <Toast.Description className="m-0 text-[13px] leading-[1.3] text-slate-600 [grid-area:_description]">
            {toastMessage}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
      </Toast.Provider>
    </div>
  );
}
