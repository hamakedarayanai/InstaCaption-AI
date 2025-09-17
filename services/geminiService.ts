import { GoogleGenAI } from "@google/genai";
import { type InstagramPost } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateInstagramCaption = async (base64ImageData: string, mimeType: string): Promise<InstagramPost> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Generate an engaging Instagram post for this image. The post should include a catchy title, a descriptive body text, and a set of relevant hashtags. The tone should be friendly, appealing, and optimized for social media engagement.

Respond ONLY with a valid JSON object in the following format:
{"title": "...", "text": "...", "hashtags": ["...", "...", "..."]}`,
                    },
                ],
            },
        });

        let jsonString = response.text.trim();
        
        // The model might wrap the JSON in markdown backticks.
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7);
        }
        if (jsonString.endsWith('```')) {
            jsonString = jsonString.substring(0, jsonString.length - 3);
        }
        jsonString = jsonString.trim();

        const parsedResponse = JSON.parse(jsonString);

        // Basic validation
        if (
            typeof parsedResponse.title !== 'string' ||
            typeof parsedResponse.text !== 'string' ||
            !Array.isArray(parsedResponse.hashtags) ||
            !parsedResponse.hashtags.every((h: any) => typeof h === 'string')
        ) {
            throw new Error("Invalid response structure from API.");
        }
        
        return parsedResponse as InstagramPost;

    } catch (error) {
        console.error("Error generating caption:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the caption from the AI. The response was not valid JSON.");
        }
        throw new Error("Failed to generate caption from Gemini API. Please check your API key and network connection.");
    }
};
