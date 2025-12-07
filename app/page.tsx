"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
    } else {
      router.push("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    const fetchAnswersFromGemini = async () => {
      const ai = new GoogleGenAI({});

      async function main() {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "Explain how AI works in a few words",
        });
        console.log(response.text);
      }

      await main();
    };

    fetchAnswersFromGemini();
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={20} />;
    </div>
  );
}
