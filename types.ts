
export interface SceneResult {
  sceneNumber: number;
  setting: string;
  action: string;
  characters: string[];
  cinematicPrompt: string;
}

export interface CharacterProfile {
  name: string;
  prompt: string;
  imageUrl?: string | null;
}
