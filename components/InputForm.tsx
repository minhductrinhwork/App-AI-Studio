
import React from 'react';
import { SpinnerIcon, SparklesIcon } from './icons';

interface InputFormProps {
    idea: string;
    setIdea: (value: string) => void;
    numberOfScenes: number;
    setNumberOfScenes: (value: number) => void;
    promptRequirements: string;
    setPromptRequirements: (value: string) => void;
    promptSuffix: string;
    setPromptSuffix: (value: string) => void;
    bannedWords: string;
    setBannedWords: (value: string) => void;
    handleGenerate: () => void;
    isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
    idea,
    setIdea,
    numberOfScenes,
    setNumberOfScenes,
    promptRequirements,
    setPromptRequirements,
    promptSuffix,
    setPromptSuffix,
    bannedWords,
    setBannedWords,
    handleGenerate,
    isLoading
}) => {
    const inputBaseClasses = "w-full p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-200 placeholder-gray-500";
    
    return (
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="space-y-6">
                <div>
                    <label htmlFor="idea" className="block text-lg font-medium text-gray-300 mb-2">
                        1. Your Core Idea
                    </label>
                    <textarea
                        id="idea"
                        rows={3}
                        className={inputBaseClasses}
                        placeholder="e.g., A lone astronaut discovers a mysterious, glowing plant on a desolate Mars."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="scenes" className="block text-lg font-medium text-gray-300 mb-2">
                        2. Desired Number of Scenes
                    </label>
                    <input
                        id="scenes"
                        type="number"
                        min="1"
                        className={inputBaseClasses}
                        placeholder="e.g., 70"
                        value={numberOfScenes}
                        onChange={(e) => setNumberOfScenes(parseInt(e.target.value, 10) || 0)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="requirements" className="block text-lg font-medium text-gray-300 mb-2">
                        3. Prompt Requirements (Optional)
                    </label>
                    <textarea
                        id="requirements"
                        rows={3}
                        className={inputBaseClasses}
                        placeholder="e.g., Blade Runner 2049 aesthetic, hyperrealistic, moody neon lighting"
                        value={promptRequirements}
                        onChange={(e) => setPromptRequirements(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="suffix" className="block text-lg font-medium text-gray-300 mb-2">
                        4. Prompt Suffix (Optional)
                    </label>
                    <input
                        id="suffix"
                        type="text"
                        className={inputBaseClasses}
                        placeholder="e.g., 8k, cinematic, photorealistic, shot on ARRI Alexa"
                        value={promptSuffix}
                        onChange={(e) => setPromptSuffix(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="banned" className="block text-lg font-medium text-gray-300 mb-2">
                        5. Banned Words (Optional)
                    </label>
                    <textarea
                        id="banned"
                        rows={2}
                        className={inputBaseClasses}
                        placeholder="e.g., cartoon, anime, ugly, deformed"
                        value={bannedWords}
                        onChange={(e) => setBannedWords(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !idea.trim()}
                        className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon />
                                Developing...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6 mr-2" />
                                Develop Idea
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputForm;
