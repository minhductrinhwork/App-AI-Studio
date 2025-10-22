import React, { useState } from 'react';
import type { SceneResult, CharacterProfile } from '../types';
import { generateImage } from '../services/geminiService';
import { exportToCsv } from '../utils/fileSaver';
import SceneCard from './SceneCard';
import { DownloadIcon } from './icons';

interface ResultsDisplayProps {
    scenes: SceneResult[];
    characterProfiles: CharacterProfile[];
    onRestart: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ scenes, characterProfiles, onRestart }) => {
    const [selectedSceneNumber, setSelectedSceneNumber] = useState<number>(scenes.length > 0 ? scenes[0].sceneNumber : -1);
    const [generatingImageForScene, setGeneratingImageForScene] = useState<number | null>(null);
    const [demoImages, setDemoImages] = useState<{ [key: number]: string }>({});
    const [error, setError] = useState<string | null>(null);

    const handleGenerateDemoImage = async (sceneNumber: number, prompt: string) => {
        setGeneratingImageForScene(sceneNumber);
        setError(null);
        try {
            const imageUrl = await generateImage(prompt);
            setDemoImages(prev => ({ ...prev, [sceneNumber]: imageUrl }));
        } catch (err: any) {
            setError(`Failed to generate image for Scene ${sceneNumber}: ${err.message}`);
        } finally {
            setGeneratingImageForScene(null);
        }
    };
    
    const selectedScene = scenes.find(s => s.sceneNumber === selectedSceneNumber);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Generated Cinematic Plan</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => exportToCsv(scenes, characterProfiles, 'cinematic_plan.csv')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export CSV
                    </button>
                    <button
                        onClick={onRestart}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                       &larr; Start Over
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md" role="alert">
                    <strong className="font-bold">Image Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Scene Navigation */}
                <div className="lg:col-span-1 bg-gray-800 p-4 rounded-xl border border-gray-700 h-full max-h-[75vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-white mb-3 sticky top-0 bg-gray-800 py-2">Scenes ({scenes.length})</h3>
                    <div className="space-y-2">
                        {scenes.map(scene => (
                            <button
                                key={scene.sceneNumber}
                                onClick={() => setSelectedSceneNumber(scene.sceneNumber)}
                                className={`w-full text-left p-3 rounded-md transition-colors text-sm ${selectedSceneNumber === scene.sceneNumber ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'}`}
                            >
                                <span className="font-bold">Scene {scene.sceneNumber}:</span> {scene.setting}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Scene Details */}
                <div className="lg:col-span-2">
                    {selectedScene ? (
                        <SceneCard
                            key={selectedScene.sceneNumber}
                            scene={selectedScene}
                            demoImageUrl={demoImages[selectedScene.sceneNumber] || null}
                            isGeneratingImage={generatingImageForScene === selectedScene.sceneNumber}
                            onGenerateImage={(prompt) => handleGenerateDemoImage(selectedScene.sceneNumber, prompt)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <p className="text-gray-400">Select a scene from the left to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;