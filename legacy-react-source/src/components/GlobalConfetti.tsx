"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export function GlobalConfetti() {
  const { unlockedAchievements } = useStore();
  const [show, setShow] = useState(false);
  const [prevCount, setPrevCount] = useState(-1);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // If it's the very first mount, just set the initial count and don't fire confetti
    if (prevCount === -1) {
      setPrevCount(unlockedAchievements.length);
      return;
    }

    // Only fire if the count went up
    if (unlockedAchievements.length > prevCount) {
      setShow(true);
      // Stop spawning new confetti after 3.5 seconds
      const stopSpawn = setTimeout(() => setShow(false), 3500);
      
      setPrevCount(unlockedAchievements.length);
      return () => clearTimeout(stopSpawn);
    }
  }, [unlockedAchievements.length, prevCount]);

  if (!show) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={400}
      gravity={0.15}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none' }}
    />
  );
}
