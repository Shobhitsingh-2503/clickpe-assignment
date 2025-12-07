import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Product } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function ProductChat({ product }: { product: Product }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages when sheet opens
  useEffect(() => {
    if (isOpen && product) {
      fetchMessages();
    }
  }, [isOpen, product]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    try {
      const url = new URL("/api/chat", window.location.href);
      url.searchParams.append("productId", product.id);
      if (user?.id) url.searchParams.append("userId", user.id);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const tempId = crypto.randomUUID();
    const newMessage: Message = {
      id: tempId,
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: user?.id, // Can be undefined, API handles it
          message: newMessage.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Maybe revert user message or show error
      // For now just console error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 hover:cursor-pointer bg-blue-500 hover:bg-blue-600 text-white hover:text-white hover:outline-none hover:cursor-pointer"
        >
          <BotMessageSquare className="h-4 w-4" />
          Enquire with AI
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full sm:max-w-md bg-white p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5" />
            {product.name} Assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto min-h-0 my-4 space-y-4 p-4 rounded-md border bg-gray-50/50">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                Ask anything about this loan product, like interest rates or
                eligibility.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border text-gray-800 rounded-bl-none"
                }`}
              >
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }: any) => (
                      <ul
                        className="list-disc pl-4 space-y-1 my-1"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }: any) => (
                      <ol
                        className="list-decimal pl-4 space-y-1 my-1"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }: any) => (
                      <p className="mb-1 last:mb-0" {...props} />
                    ),
                    strong: ({ node, ...props }: any) => (
                      <span className="font-bold" {...props} />
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border text-gray-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm shadow-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <SheetFooter className="sm:justify-between">
          <form
            onSubmit={sendMessage}
            className="flex w-full items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
