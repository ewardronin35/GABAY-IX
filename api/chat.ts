// Located at /api/chat.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// This is the Vercel/serverless function signature
export default async function handler(request: Request) {
    
    // 1. Get the API key from server-side environment variables
    //    IMPORTANT: This is 'process.env.GEMINI_API_KEY', NOT 'import.meta.env.VITE_...'
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 2. Parse the 'history' and 'systemInstruction' from the frontend's request
    const body = await request.json();
    const { history, systemInstruction } = body;

    if (!history || !systemInstruction) {
         return new Response(JSON.stringify({ error: 'Missing history or system instruction' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-05-20", // Use the same model
            systemInstruction: systemInstruction,
        });

        // Safety settings from your original prompt (optional but good)
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        // 3. Start the chat with the provided history
        const chat = model.startChat({
            history: history,
            safetySettings: safetySettings,
        });

        // The user's latest message is the last item in the history.
        // We just need to ask the model to generate the next response.
        const result = await chat.sendMessage(" "); // Send a non-empty string to trigger response

        const response = result.response;
        const text = response.text();

        // 4. Send the AI's text response back to the frontend
        return new Response(JSON.stringify({ text: text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Sorry, I'm having trouble connecting." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// This line allows Vercel to optimize the function
export const config = {
  runtime: 'edge',
};