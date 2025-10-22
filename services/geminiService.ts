
import { GoogleGenAI, Type } from "@google/genai";
import type { SceneResult, CharacterProfile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const planGenerationModel = 'gemini-2.5-flash';
const imageGenerationModel = 'imagen-3.0-generate-002';

const cinematicPlanSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sceneNumber: {
                type: Type.INTEGER,
                description: "The sequential number of the scene."
            },
            setting: {
                type: Type.STRING,
                description: "A description of the scene's location and time (e.g., 'INT. SPACESHIP - NIGHT')."
            },
            action: {
                type: Type.STRING,
                description: "A detailed description of the action, events, and character interactions in the scene."
            },
            characters: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                },
                description: "A list of character names present in this scene. Use consistent names throughout the script."
            },
            cinematicPrompt: {
                type: Type.STRING,
                description: "A single, highly detailed, and professional prompt for an AI image/video generator. This prompt must include shot type, camera movement, lighting, composition, mood, and character appearance all in one. (e.g., 'Slow dolly in on a character's face, lit by a single flickering neon sign. Extreme close-up, shallow depth of field.')"
            },
        },
        required: ["sceneNumber", "setting", "action", "characters", "cinematicPrompt"],
    }
};

const characterProfileSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "The name of the character."
            },
            prompt: {
                type: Type.STRING,
                description: "A detailed visual description prompt for the character, suitable for generating a character sheet. Focus on consistent facial features, clothing, and key attributes."
            }
        },
        required: ["name", "prompt"]
    }
};

export const extractCharacters = async (idea: string): Promise<string[]> => {
    const instruction = `From the following story idea, list all unique character names. If no specific names are mentioned, create plausible names based on the description (e.g., 'The Astronaut', 'The Detective'). Return them as a simple JSON array of strings. Idea: "${idea}"`;
    try {
        const response = await ai.models.generateContent({
            model: planGenerationModel,
            contents: instruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
                temperature: 0.2,
            }
        });
        return JSON.parse(response.text.trim()) as string[];
    } catch (e) {
        console.error("Failed to extract characters", e);
        // Return an empty array on failure so the user can add characters manually.
        return [];
    }
}

export const generateCharacterPrompts = async (
    characterNames: string[],
    idea: string,
    promptRequirements: string,
    promptSuffix: string,
    bannedWords: string,
): Promise<CharacterProfile[]> => {
    const bannedWordsInstruction = bannedWords.trim() ? `\n**Banned Words:** You MUST NOT use any of the following words in your generated prompts: "${bannedWords}".` : "";

    const systemInstruction = `You are a professional character designer for films. Based on the story idea provided, generate a detailed visual description for each character in the provided list.
These descriptions will be used as prompts for an AI image generator to create character sheets.
Focus on consistent and memorable facial features, hairstyle, clothing, and any key props or distinguishing marks.
Incorporate these general style requirements: "${promptRequirements}".
Each prompt must end with this suffix: "${promptSuffix}".
${bannedWordsInstruction}
The story idea is: "${idea}".
Return a JSON array of objects, where each object has a 'name' (matching the input name) and a 'prompt'.`;

    const response = await ai.models.generateContent({
        model: planGenerationModel,
        contents: `Generate prompts for the following characters: ${JSON.stringify(characterNames)}`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: characterProfileSchema,
            temperature: 0.7,
        }
    });

    const profiles = JSON.parse(response.text.trim()) as Omit<CharacterProfile, 'imageUrl'>[];
    return profiles.map(p => ({ ...p, imageUrl: null }));
};


export const generateCinematicPlan = async (
    idea: string,
    promptRequirements: string,
    promptSuffix: string,
    characterProfiles: CharacterProfile[],
    numberOfScenes: number,
    bannedWords: string,
): Promise<SceneResult[]> => {
    try {
        let characterInstructions = "";
        if (characterProfiles && characterProfiles.length > 0) {
            const profileDescriptions = characterProfiles.map(p => `- ${p.name}: ${p.prompt}`).join('\n');
            characterInstructions = `\n\n**Character Consistency Mandate:** To ensure visual consistency across all scenes, you MUST adhere strictly to the following detailed character descriptions. When a character from this list appears in a scene, their depiction in the 'cinematicPrompt' must match their profile.\n\n**Character Profiles:**\n${profileDescriptions}`;
        }
        
        const bannedWordsInstruction = bannedWords.trim() ? `\n**Banned Words:** You MUST NOT use any of the following words in the 'cinematicPrompt': "${bannedWords}".` : "";


        const systemInstruction = `You are a creative AI assistant specializing in professional filmmaking and cinematography. Your task is to take a user's story idea and develop it into a structured cinematic plan.
1.  First, expand the user's idea into a detailed script, breaking it down into approximately **${numberOfScenes} sequentially numbered scenes** to provide comprehensive coverage.
2.  For each scene, provide a setting, a detailed action description, and a list of characters present. **Crucially, invent and use consistent names for characters throughout all scenes.** ${characterInstructions}
3.  For each scene, you will then create one specific, combined prompt:
    a.  **Cinematic Prompt:** A single, comprehensive prompt that is highly detailed and professional for an AI image/video generator. This prompt must produce a cinematic, visually stunning shot. It must describe shot type (e.g., medium shot, extreme close-up), camera lens/angle, lighting (e.g., chiaroscuro, golden hour), color grading, composition, mood, character details, AND the camera movement/dynamic for the shot (e.g., 'Slow dolly in', 'Static shot', 'Crane shot down'). The prompt must incorporate the user's specific requirements: "${promptRequirements}". The prompt **MUST** end with the user's suffix: "${promptSuffix}".
4.  ${bannedWordsInstruction}
5.  Return the entire output as a JSON array following the provided schema.`;

        const response = await ai.models.generateContent({
            model: planGenerationModel,
            contents: `User's Idea: "${idea}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: cinematicPlanSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as SceneResult[];
        return result;

    } catch (error) {
        console.error("Error generating cinematic plan:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Failed to generate cinematic plan: ${error.message}`));
        }
        return Promise.reject(new Error("An unknown error occurred while generating the cinematic plan."));
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Failed to generate image: ${error.message}`));
        }
        return Promise.reject(new Error("An unknown error occurred while generating the image."));
    }
};
