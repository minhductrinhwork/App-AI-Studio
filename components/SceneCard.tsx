
import React from 'react';
import type { SceneResult } from '../types';
import { SpinnerIcon, FilmIcon } from './icons';

interface SceneCardProps {
    scene: SceneResult;
    demoImageUrl: string | null;
    isGeneratingImage: boolean;
    onGenerateImage: (prompt: string) => void;
}

const InfoPill: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-gray-700/50 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">{label}</p>
        <p className="text-gray-200 mt-1">{value}</p>
    </div>
);

const SceneCard: React.FC<SceneCardProps> = ({ scene, demoImageUrl, isGeneratingImage, onGenerateImage }) => {
    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg transition-all duration-300 hover:border-blue-600/50">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white">{`Scene ${scene.sceneNumber}: ${scene.setting}`}</h3>
                        {scene.characters.length > 0 && (
                            <p className="text-sm text-gray-400 mt-1">Characters: {scene.characters.join(', ')}</p>
                        )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <button
                            onClick={() => onGenerateImage(scene.cinematicPrompt)}
                            disabled={isGeneratingImage}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-wait transition"
                        >
                            {isGeneratingImage ? (
                                <>
                                    <SpinnerIcon className="w-4 h-4 mr-2"/>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FilmIcon className="w-4 h-4 mr-2"/>
                                    Demo Image
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-md">
                        <p className="text-gray-300">{scene.action}</p>
                    </div>
                    <div>
                        <InfoPill label="Cinematic Prompt" value={scene.cinematicPrompt} />
                    </div>
                </div>
            </div>

            {(isGeneratingImage || demoImageUrl) && (
                <div className="bg-black/50 p-4 mt-2">
                    {isGeneratingImage && (
                        <div className="aspect-video w-full flex items-center justify-center bg-gray-700 rounded-md animate-pulse">
                            <SpinnerIcon className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                    {demoImageUrl && !isGeneratingImage && (
                        <img src={demoImageUrl} alt={`Generated demo for Scene ${scene.sceneNumber}`} className="w-full h-auto object-cover rounded-md" />
                    )}
                </div>
            )}
        </div>
    );
};

export default SceneCard;
