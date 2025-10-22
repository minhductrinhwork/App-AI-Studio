import React, { useState, useEffect } from 'react';
import type { CharacterProfile } from '../types';
import { generateImage } from '../services/geminiService';
import { SpinnerIcon, FilmIcon } from './icons';

interface CharacterGeneratorProps {
    initialCharacters: string[];
    onGeneratePrompts: (characters: string[]) => Promise<void>;
    onGeneratePlan: (profiles: CharacterProfile[]) => void;
    onBack: () => void;
    generatedProfiles: CharacterProfile[];
    isLoading: boolean;
}

const CharacterGenerator: React.FC<CharacterGeneratorProps> = ({
    initialCharacters,
    onGeneratePrompts,
    onGeneratePlan,
    onBack,
    generatedProfiles,
    isLoading
}) => {
    const [characters, setCharacters] = useState<string[]>(initialCharacters);
    const [newCharName, setNewCharName] = useState('');
    const [profiles, setProfiles] = useState<CharacterProfile[]>(generatedProfiles);
    const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);

    useEffect(() => {
        setProfiles(generatedProfiles);
    }, [generatedProfiles]);

    const handleCharacterNameChange = (index: number, newName: string) => {
        const updated = [...characters];
        updated[index] = newName;
        setCharacters(updated);
    };
    
    const handleAddCharacter = () => {
        if (newCharName.trim() && !characters.includes(newCharName.trim())) {
            setCharacters([...characters, newCharName.trim()]);
            setNewCharName('');
        }
    };
    
    const handleRemoveCharacter = (index: number) => {
        setCharacters(characters.filter((_, i) => i !== index));
    };

    const handleGenerateDemoImage = async (profile: CharacterProfile) => {
        setGeneratingImageFor(profile.name);
        try {
            const imageUrl = await generateImage(profile.prompt);
            setProfiles(prev => prev.map(p => p.name === profile.name ? { ...p, imageUrl } : p));
        } catch (error) {
            console.error(`Failed to generate image for ${profile.name}`, error);
            // Optionally set an error state here
        } finally {
            setGeneratingImageFor(null);
        }
    };
    
    const hasGeneratedPrompts = profiles.length > 0;

    return (
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Step 2: Define Your Characters</h2>
                <p className="text-gray-400 mt-1">Review the characters from your idea. Add, remove, or edit names, then generate detailed visual prompts for consistency. Or, skip this step.</p>
            </div>

            <div className="space-y-4">
                {characters.map((name, index) => {
                    const profile = profiles.find(p => p.name === name);
                    const isGeneratingThisImage = generatingImageFor === name;

                    return (
                        <div key={index} className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleCharacterNameChange(index, e.target.value)}
                                    className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-200"
                                    disabled={hasGeneratedPrompts || isLoading}
                                />
                                <button onClick={() => handleRemoveCharacter(index)} className="text-red-400 hover:text-red-300 disabled:text-gray-500" disabled={hasGeneratedPrompts || isLoading}>Remove</button>
                            </div>
                            {profile && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-gray-400 p-3 bg-gray-800 rounded-md">{profile.prompt}</p>
                                    <div className="flex gap-4 items-center">
                                         <button
                                            onClick={() => handleGenerateDemoImage(profile)}
                                            disabled={isGeneratingThisImage || !!profile.imageUrl}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                                        >
                                            {isGeneratingThisImage ? <><SpinnerIcon className="w-4 h-4 mr-2"/>Creating...</> : <><FilmIcon className="w-4 h-4 mr-2"/>Generate Image</>}
                                        </button>
                                        {profile.imageUrl && <span className="text-green-400 text-sm">Image generated.</span>}
                                    </div>
                                    {isGeneratingThisImage && <div className="aspect-video w-full max-w-sm flex items-center justify-center bg-gray-700 rounded-md animate-pulse mt-2"><SpinnerIcon className="w-8 h-8 text-gray-400" /></div>}
                                    {profile.imageUrl && <img src={profile.imageUrl} alt={`Demo of ${profile.name}`} className="mt-2 rounded-lg max-w-sm" />}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!hasGeneratedPrompts && (
                 <div className="flex items-center gap-2">
                     <input
                         type="text"
                         value={newCharName}
                         onChange={(e) => setNewCharName(e.target.value)}
                         placeholder="Add a new character name"
                         className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-200"
                         disabled={isLoading}
                     />
                     <button onClick={handleAddCharacter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white disabled:bg-gray-500" disabled={isLoading}>Add</button>
                 </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-700">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition w-full sm:w-auto">
                    &larr; Back to Idea
                </button>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                     {!hasGeneratedPrompts && (
                         <button
                            onClick={() => onGeneratePrompts(characters)}
                            className="px-6 py-3 border border-blue-500 text-blue-300 font-bold rounded-md hover:bg-blue-500/20 transition disabled:opacity-50 w-full"
                            disabled={isLoading || characters.length === 0}
                        >
                            Generate Character Prompts
                        </button>
                     )}
                    <button
                        onClick={() => onGeneratePlan(profiles)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition disabled:bg-gray-500 w-full"
                        disabled={isLoading}
                    >
                        {hasGeneratedPrompts ? "Generate Plan With Characters" : "Skip and Generate Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterGenerator;
