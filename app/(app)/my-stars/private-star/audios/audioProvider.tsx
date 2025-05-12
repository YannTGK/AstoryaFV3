import React, { createContext, useContext, useState } from "react";

interface AudioItem {
  uri: string;
  title: string;
  description: string;
  to: string;
  date: string;
}

const AudioContext = createContext<{
  audios: AudioItem[];
  addAudio: (audio: AudioItem) => void;
  removeAudio: (index: number) => void; // ✅ toegevoegd
} | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audios, setAudios] = useState<AudioItem[]>([]);

  const addAudio = (audio: AudioItem) => {
    setAudios(prev => [...prev, audio]);
  };

  const removeAudio = (index: number) => {
    setAudios(prev => prev.filter((_, i) => i !== index)); // ✅ verwijdert audio op basis van index
  };

  return (
    <AudioContext.Provider value={{ audios, addAudio, removeAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used inside AudioProvider");
  return context;
};
