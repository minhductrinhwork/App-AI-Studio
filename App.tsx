
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import CharacterGenerator from './components/CharacterGenerator';
import ResultsDisplay from './components/ResultsDisplay';
import { extractCharacters, generateCharacterPrompts, generateCinematicPlan, generateImage } from './services/geminiService';
import type { SceneResult, CharacterProfile } from './types';

type AppStep = 'input' | 'characters' | 'results';

const App: React.FC = () => {
    // Inputs
    const [idea, setIdea] = useState<string>('');
    const [promptRequirements, setPromptRequirements] = useState<string>('');
    const [promptSuffix, setPromptSuffix] = useState<string>('cinematic, 8k, photorealistic');
    const [numberOfScenes, setNumberOfScenes] = useState<number>(70);
    const [bannedWords, setBannedWords] = useState<string>('');
    
    // App State
    const [step, setStep] = useState<AppStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Loading States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    
    // Data
    const [characters, setCharacters] = useState<string[]>([]);
    const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
    const [sceneResults, setSceneResults] = useState<SceneResult[] | null>(null);

    const handleStartGeneration = useCallback(async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setLoadingMessage('Extracting characters...');
        setError(null);
        setCharacters([]);
        setCharacterProfiles([]);
        setSceneResults(null);
        
        try {
            const extracted = await extractCharacters(idea);
            setCharacters(extracted);
            setStep('characters');
        } catch (err: any) {
            setError(err.message || 'Failed to extract characters.');
        } finally {
            setIsLoading(false);
        }
    }, [idea]);

    const handleCharacterPrompts = useCallback(async (finalCharacters: string[]) => {
        setIsLoading(true);
        setLoadingMessage('Generating character profiles...');
        setError(null);
        try {
            const profiles = await generateCharacterPrompts(finalCharacters, idea, promptRequirements, promptSuffix, bannedWords);
            setCharacterProfiles(profiles);
        } catch (err: any) {
            setError(err.message || 'Failed to generate character profiles.');
        } finally {
            setIsLoading(false);
        }
    }, [idea, promptRequirements, promptSuffix, bannedWords]);
    
    const handleGeneratePlan = useCallback(async (finalProfiles: CharacterProfile[]) => {
        setIsLoading(true);
        setLoadingMessage('Generating full cinematic plan (this may take a moment)...');
        setError(null);
        try {
            const plan = await generateCinematicPlan(idea, promptRequirements, promptSuffix, finalProfiles, numberOfScenes, bannedWords);
            setSceneResults(plan);
            setStep('results');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            // Stay on character page on error to allow retry
        } finally {
            setIsLoading(false);
        }
    }, [idea, promptRequirements, promptSuffix, numberOfScenes, bannedWords]);

    const handleBackToStart = () => {
        setStep('input');
        setSceneResults(null);
        setCharacterProfiles([]);
        setCharacters([]);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {step === 'input' && (
                        <div className="max-w-4xl mx-auto">
                            <InputForm
                                idea={idea}
                                setIdea={setIdea}
                                promptRequirements={promptRequirements}
                                setPromptRequirements={setPromptRequirements}
                                promptSuffix={promptSuffix}
                                setPromptSuffix={setPromptSuffix}
                                numberOfScenes={numberOfScenes}
                                setNumberOfScenes={setNumberOfScenes}
                                bannedWords={bannedWords}
                                setBannedWords={setBannedWords}
                                handleGenerate={handleStartGeneration}
                                isLoading={isLoading}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {isLoading && step !== 'input' && (
                         <div className="text-center py-10 px-6 bg-gray-800/50 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-300 animate-pulse">{loadingMessage}</h3>
                        </div>
                    )}

                    {step === 'characters' && !isLoading && (
                        <CharacterGenerator
                            initialCharacters={characters}
                            onGeneratePrompts={handleCharacterPrompts}
                            onGeneratePlan={handleGeneratePlan}
                            onBack={handleBackToStart}
                            generatedProfiles={characterProfiles}
                            isLoading={isLoading}
                        />
                    )}
                    
                    {step === 'results' && sceneResults && (
                        <ResultsDisplay 
                            scenes={sceneResults}
                            characterProfiles={characterProfiles}
                            onRestart={handleBackToStart}
                        />
                    )}

                    {step === 'input' && !isLoading && (
                         <div className="max-w-4xl mx-auto text-center py-16 px-6 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                            <h3 className="text-xl font-medium text-gray-300">Start your cinematic journey here.</h3>
                            <p className="mt-2 text-gray-400">Fill out the form above and click "Develop Idea" to bring your story to life, step by step.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
