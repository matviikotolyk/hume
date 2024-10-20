"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Text,
  TextField,
  Button,
  Heading,
} from "@radix-ui/themes";
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
    getUser();

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
              <Button onClick={handleSignIn}>Sign In</Button>
              <Button onClick={handleSignUp} variant="soft">
                Sign Up
              </Button>
            </Flex>
          )}
        </Box>
      </Box>
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={3000}
        >
          <Toast.Title>
            {toastType === "success" ? "Success" : "Error"}
          </Toast.Title>
          <Toast.Description>{toastMessage}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </div>
  );
}
