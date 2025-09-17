
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

        const jsonString = response.text;
        const parsedResponse = JSON.parse(jsonString);
        
        return parsedResponse as InstagramPost;

    } catch (error) {
        console.error("Error generating caption:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the caption from the AI. The response was not valid JSON.");
        }
        throw new Error("Failed to generate caption from Gemini API. Please check your API key and network connection.");
    }
};
