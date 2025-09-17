import { GoogleGenAI, Type } from "@google/genai";
import { type InstagramPost } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const captionSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A catchy title for the Instagram post."
        },
        text: {
            type: Type.STRING,
            description: "The main body of the Instagram caption."
        },
        hashtags: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A relevant hashtag for the post, without the '#' symbol."
            },
            description: "A list of relevant hashtags."
        }
    },
    required: ["title", "text", "hashtags"]
};


export const generateInstagramCaption = async (base64ImageData: string, mimeType: string): Promise<InstagramPost> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Analyze this image and generate an engaging Instagram post for it. The post should include a catchy title, a descriptive body text, and a set of relevant hashtags. The tone should be friendly, appealing, and optimized for social media engagement.`,
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: captionSchema,
            },
        });

        if (response.promptFeedback?.blockReason) {
            throw new Error(`Request was blocked. Reason: ${response.promptFeedback.blockReason}. Please try a different image.`);
        }

        const candidate = response.candidates?.[0];

        if (!candidate || !candidate.content) {
            const finishReason = candidate?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`Caption generation failed. Reason: ${finishReason}. This can happen due to safety settings or other content restrictions.`);
            }
            throw new Error("The AI returned an empty response. Please try again with a different image.");
        }

        const jsonString = response.text;
        
        if (!jsonString) {
            throw new Error("The AI returned an empty caption. Please try again.");
        }
        
        const parsedResponse = JSON.parse(jsonString);
        
        return parsedResponse as InstagramPost;

    } catch (error) {
        console.error("Error generating caption:", error);
        
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the caption from the AI. The response was not valid JSON. The model may have failed to follow instructions.");
        }

        if (error instanceof Error) {
            // Rethrow custom-handled errors from the try block
            if (
                error.message.startsWith('Request was blocked') || 
                error.message.startsWith('Caption generation failed') || 
                error.message.startsWith('The AI returned an empty response') ||
                error.message.startsWith('The AI returned an empty caption')
            ) {
                throw error;
            }

            // Check for specific API error messages
            if (error.message.includes('API key not valid')) {
                throw new Error('The provided API key is not valid. Please check your configuration.');
            }
            if (error.message.includes('quota')) {
                throw new Error('You have exceeded your API quota. Please check your Google AI Studio account.');
            }
        }
        
        throw new Error("An unexpected error occurred while generating the caption. Please check your network or the browser console for details.");
    }
};
