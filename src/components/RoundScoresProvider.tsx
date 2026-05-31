"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface RoundScoresContextValue {
  scoresVisible: boolean;
  showScores: () => void;
}

const RoundScoresContext = createContext<RoundScoresContextValue>({
  scoresVisible: true,
  showScores: () => {},
});

export function RoundScoresProvider({ children }: { children: ReactNode }) {
  const [scoresVisible, setScoresVisible] = useState(false);
  const showScores = useCallback(() => setScoresVisible(true), []);

  const value = useMemo(
    () => ({ scoresVisible, showScores }),
    [scoresVisible, showScores],
  );

  return (
    <RoundScoresContext.Provider value={value}>
      {children}
    </RoundScoresContext.Provider>
  );
}

export function useRoundScores() {
  return useContext(RoundScoresContext);
}
