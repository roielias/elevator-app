import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { sleep } from "../utils";
import dingSoundFile from "../assets/ding.mp3";

const dingAudio = new Audio(dingSoundFile);
dingAudio.preload = "auto";

const playSound = () => {
  try {
    dingAudio.currentTime = 0;
    dingAudio.play().catch((err) => {
      console.warn("Audio playback blocked:", err);
    });
  } catch (err) {
    console.warn("Audio error:", err);
  }
};

export class Elevator {
  id: string;
  currentFloor: number = 0;
  exactPosition: number = 0;
  targetFloors: number[] = [];
  isMoving: boolean = false;
  listeners: ((elevator: Elevator) => void)[] = [];

  constructor(id: string) {
    this.id = id;
  }

  addListener(fn: (e: Elevator) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  addTarget(floor: number) {
    if (!this.targetFloors.includes(floor)) {
      this.targetFloors.push(floor);
      this.notify();
    }
  }

  async start() {
    if (this.isMoving || this.targetFloors.length === 0) return;
    this.isMoving = true;
    this.notify();

    while (this.targetFloors.length > 0) {
      const next = this.targetFloors[0];
      const startPosition = this.exactPosition;
      const endPosition = next;
      const totalDistance = Math.abs(startPosition - endPosition);
      const direction = startPosition < endPosition ? 1 : -1;

      const totalTravelTime = totalDistance * FLOOR_DURATION * 1000; // Convert seconds to milliseconds
      const updatesPerSecond = 30;
      const updateInterval = 1000 / updatesPerSecond; // Convert Hz to ms interval
      const totalUpdates = Math.max(
        1,
        Math.ceil(totalTravelTime / updateInterval)
      );
      const distancePerUpdate = totalDistance / totalUpdates;

      for (let i = 1; i <= totalUpdates; i++) {
        this.exactPosition = startPosition + direction * distancePerUpdate * i;
        const newFloor = Math.round(this.exactPosition);
        if (newFloor !== this.currentFloor) {
          this.currentFloor = newFloor;
        }
        this.notify();
        await sleep(updateInterval);
      }

      this.exactPosition = endPosition;
      this.currentFloor = next;
      this.notify();
      playSound();
      await sleep(STOP_DURATION * 1000); // Convert seconds to milliseconds
      this.targetFloors.shift();
      this.notify();
    }

    this.isMoving = false;
    this.notify();
  }
}
