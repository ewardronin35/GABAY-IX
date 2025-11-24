<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // Import Laravel's Http client
use Illuminate\Support\Facades\Log;   // For logging errors

class ChatbotController extends Controller
{
    /**
     * Handle the chatbot request from the frontend.
     */
    public function chat(Request $request)
    {
        // 1. Get the data from your React frontend
        $history = $request->input('history');
        $systemInstruction = $request->input('systemInstruction');

        // 2. Get the API key securely from your .env file
        //    (Make sure GEMINI_API_KEY is set in your .env)
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            Log::error('GEMINI_API_KEY is not set in .env file.');
            return response()->json(['error' => 'API key not configured on the server.'], 500);
        }

        if (!$history || !$systemInstruction) {
            return response()->json(['error' => 'Missing history or system instruction.'], 400);
        }

        // 3. Format the payload for the Google API
        $payload = [
            'contents' => $history,
            'systemInstruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            // You can add safety settings here if needed
            'safetySettings' => [
                ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
            ]
        ];

        // 4. Make the secure, server-to-server call to Google's API
        try {
            // Use the stable 1.5 Flash model
// UPDATED: Using the stable Gemini 2.5 Flash model (Standard for late 2025)
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";
            
            $response = Http::post($apiUrl, $payload);

            if (!$response->successful()) {
                Log::error('Gemini API Error: ' . $response->body());
                return response()->json(['error' => 'An error occurred with the AI service.'], $response->status());
            }

            // 5. Parse the response and send *only* the text back to React
            $text = $response->json('candidates.0.content.parts.0.text');

            if ($text) {
                // This is the successful JSON response React is expecting
                return response()->json(['text' => $text]);
            } else {
                Log::warning('Gemini API Warning: No text content in response.');
                return response()->json(['error' => 'No content from API.'], 500);
            }

        } catch (\Exception $e) {
            Log::error('Chatbot Controller Error: ' . $e->getMessage());
            return response()->json(['error' => "Sorry, I'm having trouble connecting."], 500);
        }
    }
}