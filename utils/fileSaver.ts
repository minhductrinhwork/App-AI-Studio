
import type { SceneResult, CharacterProfile } from '../types';

const escapeCsvCell = (cellData: string) => {
    if (/[",\n]/.test(cellData)) {
        return `"${cellData.replace(/"/g, '""')}"`;
    }
    return cellData;
};

export const exportToCsv = (scenes: SceneResult[], characterProfiles: CharacterProfile[], filename: string = 'cinematic_plan.csv') => {
    if (!scenes || scenes.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const characterPromptMap = new Map(characterProfiles.map(p => [p.name.toLowerCase(), p.prompt]));

    const headers = [
        'Scene Number',
        'Setting',
        'Action',
        'Characters',
        'Cinematic Prompt',
        'Character Prompts'
    ];
    
    const rows = scenes.map(scene => {
        const charPrompts = scene.characters
            .map(char => characterPromptMap.get(char.toLowerCase()))
            .filter(Boolean) // Filter out any characters that might not have a profile
            .join('; '); // Join multiple character prompts with a semicolon

        return [
            scene.sceneNumber.toString(),
            escapeCsvCell(scene.setting),
            escapeCsvCell(scene.action),
            escapeCsvCell(scene.characters.join(', ')),
            escapeCsvCell(scene.cinematicPrompt),
            escapeCsvCell(charPrompts)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
