import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { sleep } from "../utils";
import dingSoundFile from "../assets/ding.mp3";

// Ding sound effect played when elevator arrives at a floor
const dingAudio = new Audio(dingSoundFile);
dingAudio.preload = "auto";

// Plays a 'ding' sound to indicate elevator arrival
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
  currentFloor: number = 0; // Floor number as integer
  exactPosition: number = 0; // Precise elevator position (float, for animation)
  targetFloors: number[] = []; // Queue of target floors
  isMoving: boolean = false; // True while elevator is in motion
  isCurrentlyStopping: boolean = false; // True while elevator is waiting at a floor
  remainingStopTime: number = 0; // Remaining time to stay stopped at current floor (in seconds)

  /** Subscribers to elevator state changes (used by UI to react to state updates) */
  listeners: ((elevator: Elevator) => void)[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Subscribe to elevator state updates.
   * Useful for UI to re-render in response to changes.
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
   * Notifies all subscribed listeners about a change in elevator state.
   */
  private notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  /**
   * Adds a floor to the elevator's queue if it's not already present.
   * @param floor Floor number to visit
   */
  addTarget(floor: number) {
    if (!this.targetFloors.includes(floor)) {
      this.targetFloors.push(floor);
      this.notify();
    }
  }

  /**
   * Begins processing the elevator's target floor queue.
   * Animates smooth movement, handles floor stops, and plays sound on arrival.
   */
  async start() {
    if (this.isMoving || this.targetFloors.length === 0) return;

    this.isMoving = true;
    this.notify();

    const updatesPerSecond = 30;
    const intervalMs = 1000 / updatesPerSecond;

    while (this.targetFloors.length > 0) {
      const next = this.targetFloors[0];
      const startPosition = this.exactPosition;
      const endPosition = next;
      const totalDistance = Math.abs(startPosition - endPosition);
      const direction = startPosition < endPosition ? 1 : -1;

      // Calculate travel time and steps for animation
      const totalTravelTime = totalDistance * FLOOR_DURATION * 1000; // ms
      const updateInterval = 1000 / updatesPerSecond;
      const totalUpdates = Math.max(
        1,
        Math.ceil(totalTravelTime / updateInterval)
      );
      const distancePerUpdate = totalDistance / totalUpdates;

      // Move smoothly toward target floor
      for (let i = 1; i <= totalUpdates; i++) {
        this.exactPosition = startPosition + direction * distancePerUpdate * i;
        const newFloor = Math.round(this.exactPosition);

        if (newFloor !== this.currentFloor) {
          this.currentFloor = newFloor;
        }

        this.notify();
        await sleep(updateInterval);
      }

      // Snap to final position
      this.exactPosition = endPosition;
      this.currentFloor = next;

      // Handle stop at floor
      this.isCurrentlyStopping = true;
      this.remainingStopTime = STOP_DURATION;
      this.notify();
      playSound();

      // Countdown remaining stop time gradually for better ETA precision
      while (this.remainingStopTime > 0) {
        await sleep(intervalMs);
        this.remainingStopTime = Math.max(
          0,
          this.remainingStopTime - intervalMs / 1000
        );
        this.notify();
      }

      this.targetFloors.shift(); // Remove completed target

      this.isCurrentlyStopping = false;
      this.notify();
    }

    this.isMoving = false;
    this.notify();
  }
}
