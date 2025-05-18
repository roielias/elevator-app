import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { sleep } from "../utils";
import dingSoundFile from "../assets/ding.mp3";

// Ding sound effect played when elevator arrives at a floor
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

/**
 * Represents a single elevator and its behavior.
 */
export class Elevator {
  id: string;
  currentFloor: number = 0;
  exactPosition: number = 0;
  targetFloors: number[] = [];
  isMoving: boolean = false;
  isCurrentlyStopping: boolean = false;

  /** Subscribers to state changes */
  listeners: ((elevator: Elevator) => void)[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Subscribe to elevator state updates.
   * @param fn Listener callback
   * @returns A cleanup function to remove the listener
   */
  addListener(fn: (e: Elevator) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  /**
   * Notify all listeners of state changes.
   */
  private notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  /**
   * Adds a floor to the elevator's target list if not already present.
   * @param floor Floor number to visit
   */
  addTarget(floor: number) {
    if (!this.targetFloors.includes(floor)) {
      this.targetFloors.push(floor);
      this.notify();
    }
  }

  /**
   * Begins processing the elevator's target queue.
   * Smoothly animates movement and plays sound on arrival.
   */
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

      const totalTravelTime = totalDistance * FLOOR_DURATION * 1000; // convert seconds to milliseconds
      const updatesPerSecond = 30; // how many times per second the elevator updates its position
      const updateInterval = 1000 / updatesPerSecond; // convert to milliseconds per update
      // total number of position updates for the full travel duration
      const totalUpdates = Math.max(
        1,
        Math.ceil(totalTravelTime / updateInterval)
      );

      // distance moved in each update tick
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

      // Set the flag indicating the elevator is now stopping at a floor
      this.isCurrentlyStopping = true;
      this.notify();
      playSound();

      await sleep(STOP_DURATION * 1000); // wait at floor before continuing
      this.targetFloors.shift();

      // Reset the stopping flag
      this.isCurrentlyStopping = false;
      this.notify();
    }

    this.isMoving = false;
    this.notify();
  }
}
