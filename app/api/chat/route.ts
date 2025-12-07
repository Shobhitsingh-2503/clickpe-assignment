import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import supabase from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { productId, userId, message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 1. Store user message
    const userMessageId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from("ai_chat_messages")
      .insert({
        id: userMessageId,
        user_id: userId || null,
        product_id: productId || null,
        role: "user",
        content: message,
      });

    if (insertError) {
      console.error("Error inserting user message:", insertError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // 2. Build Context
    let productContext = "";
    if (productId) {
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      if (product) {
        productContext = `
Context Code: PRODUCT_DETAILS
Product Name: ${product.name}
Bank: ${product.bank}
Loan Type: ${product.type}
Interest Rate (APR): ${product.rate_apr}%
Minimum Income Required: ${product.min_income}
Minimum Credit Score: ${product.min_credit_score}
Processing Fee: ${
          product.processing_fee_pct ? product.processing_fee_pct + "%" : "N/A"
        }
Prepayment Allowed: ${product.prepayment_allowed ? "Yes" : "No"}
Disbursal Speed: ${product.disbursal_speed || "Standard"}

Instructions: 
You are a helpful banking assistant specialized in explaining this specific loan product. 
Answer the user's question using the details above. 
If the user asks about something not in the details, provide a general answer but mention you are referring to general banking principles or ask them to check with the bank.
Keep answers concise and professional.
`;
      }
    }

    // 3. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    const ai = new GoogleGenAI({ apiKey });

    // Try a known stable model identifier or fallback
    // We will attempt to use gemini-1.5-flash.
    // If it fails, we will list models and pick the first available one that looks like a chat model.
    let modelId = "gemini-1.5-flash";

    // Helper to generate content
    const generate = async (mId: string) => {
      return await ai.models.generateContent({
        model: mId,
        contents: [
          {
            role: "user",
            parts: [{ text: productContext }, { text: message }],
          },
        ],
      });
    };

    let response;
    try {
      response = await generate(modelId);
    } catch (genError: any) {
      console.error(`Error with model ${modelId}:`, genError.message);

      // Fallback logic
      try {
        console.log("Attempting to find an available model...");
        const modelsResponse = await ai.models.list();
        // The structure of response depends on SDK version, usually it's an array or { models: [] }
        // Let's assume it is iterable or has .models

        let availableModels: string[] = [];
        // @ts-ignore
        if (modelsResponse.models) {
          // @ts-ignore
          availableModels = modelsResponse.models.map((m: any) =>
            m.name.replace("models/", "")
          );
        } else if (Array.isArray(modelsResponse)) {
          availableModels = modelsResponse.map((m: any) =>
            m.name.replace("models/", "")
          );
        } else {
          // assume iterable
          // @ts-ignore
          for await (const m of modelsResponse) {
            // @ts-ignore
            availableModels.push(m.name.replace("models/", ""));
          }
        }

        console.log("Found models:", availableModels);

        // Prefer flash, then pro, then anything starting with gemini
        const fallbackModel =
          availableModels.find(
            (m) => m.includes("flash") && m.includes("1.5")
          ) ||
          availableModels.find((m) => m.includes("flash")) ||
          availableModels.find((m) => m.includes("pro")) ||
          availableModels.find((m) => m.startsWith("gemini"));

        if (fallbackModel) {
          console.log(`Retrying with fallback model: ${fallbackModel}`);
          modelId = fallbackModel;
          response = await generate(fallbackModel);
        } else {
          throw new Error("No suitable Gemini model found.");
        }
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        throw genError; // Throw existing error if fallback fails
      }
    }

    const aiText =
      response?.text || "I'm sorry, I couldn't generate a response.";

    // 4. Store assistant message
    const aiMessageId = crypto.randomUUID();
    const { error: aiInsertError } = await supabase
      .from("ai_chat_messages")
      .insert({
        id: aiMessageId,
        user_id: userId || null,
        product_id: productId || null,
        role: "assistant",
        content: aiText,
      });

    if (aiInsertError) console.error("Error saving AI response", aiInsertError);

    return NextResponse.json({
      id: aiMessageId,
      role: "assistant",
      content: aiText,
      created_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Error Details:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const userId = searchParams.get("userId");

  let query = supabase
    .from("ai_chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (productId) query = query.eq("product_id", productId);

  // If userId is provided, usage depends on logic.
  // Usually we want to see messages for this user and product.
  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    // If no user, maybe don't show any history? Or anon history?
    // Since we insert with null userId if not provided, we can fetch where user_id is null.
    // query = query.is("user_id", null);
    // But for safety let's just require one or other or both.
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
