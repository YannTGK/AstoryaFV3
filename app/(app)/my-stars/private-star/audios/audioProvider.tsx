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
} | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audios, setAudios] = useState<AudioItem[]>([]);

  const addAudio = (audio: AudioItem) => {
    setAudios(prev => [...prev, audio]);
  };

  return (
    <AudioContext.Provider value={{ audios, addAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used inside AudioProvider");
  return context;
};
