import dingSoundFile from "../assets/ding.mp3";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Ding sound effect played when elevator arrives at a floor
const dingAudio = new Audio(dingSoundFile);
dingAudio.preload = "auto";

// Plays a 'ding' sound to indicate elevator arrival
export const playSound = () => {
  try {
    dingAudio.currentTime = 0;
    dingAudio.play().catch((err) => {
      console.warn("Audio playback blocked:", err);
    });
  } catch (err) {
    console.warn("Audio error:", err);
  }
};
