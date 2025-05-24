import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { sleep, playSound } from "../utils";

/**
 * Represents a single elevator and its behavior.
 * Uses CSS transitions for smooth, accurate movement instead of manual animation.
 */
export class Elevator {
  id: string;
  currentFloor: number = 0; // Current floor number (integer)
  exactPosition: number = 0; // Precise elevator position for CSS positioning (float)
  targetFloors: number[] = []; // Queue of target floors
  isMoving: boolean = false; // True while elevator is in motion
  isCurrentlyStopping: boolean = false; // True while elevator is stopping at a floor
  remainingStopTime: number = 0; // Remaining time to stay stopped (seconds)

  // properties for CSS transition-based animation
  animationStartPosition: number = 0; // Position where current animation started
  animationTargetPosition: number = 0; // Target position for current animation
  animationDuration: number = 0; // Duration of current transition (seconds)
  animationStartTime: number = 0; // Timestamp when animation started

  /** Subscribers to elevator state changes */
  listeners: ((elevator: Elevator) => void)[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Subscribe to elevator state updates.
   * @param fn Listener callback
   * @returns Cleanup function to remove the listener
   */
  addListener(fn: (e: Elevator) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  /**
   * Notifies all subscribed listeners about state changes.
   */
  private notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  /**
   * Adds a floor to the elevator's queue if not already present.
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
   * Uses CSS transitions for accurate, smooth movement.
   */
  async start() {
    if (this.isMoving || this.targetFloors.length === 0) return;

    this.isMoving = true;
    this.notify();

    while (this.targetFloors.length > 0) {
      const targetFloor = this.targetFloors[0];
      await this.moveToFloor(targetFloor);
      await this.stopAtFloor(targetFloor);
      this.targetFloors.shift(); // Remove completed target
    }

    this.isMoving = false;
    this.notify();
  }

  /**
   * Moves elevator to specified floor using CSS transition.
   * @param targetFloor Destination floor number
   */
  private async moveToFloor(targetFloor: number): Promise<void> {
    const startPosition = this.exactPosition;
    const distance = Math.abs(targetFloor - startPosition);
    const moveDuration = distance * FLOOR_DURATION;

    if (distance === 0) return; // Already at target floor

    // Set up CSS transition parameters
    this.animationStartPosition = startPosition;
    this.animationTargetPosition = targetFloor;
    this.animationDuration = moveDuration;
    this.animationStartTime = Date.now();

    // Update position for CSS transition
    this.exactPosition = targetFloor;
    this.notify();

    // Wait for movement to complete with precise timing
    const sleepDuration = moveDuration * 1000;
    await sleep(sleepDuration);

    // Update current floor when movement is complete
    this.currentFloor = targetFloor;
    this.animationDuration = 0; // Clear transition for stop phase
    this.notify();
  }

  /**
   * Handles elevator stop at a floor with countdown timer.
   * @param floor Floor number where elevator stops
   */
  private async stopAtFloor(floor: number): Promise<void> {
    this.isCurrentlyStopping = true;
    this.remainingStopTime = STOP_DURATION;
    this.animationDuration = 0; // No transition during stop
    this.notify();

    playSound();

    // Use precise timing instead of polling updates
    const stopStartTime = Date.now();
    const stopDurationMs = STOP_DURATION * 1000;

    // Update timer display with high precision
    const updateInterval = 50; // 50ms for smooth display
    const timer = setInterval(() => {
      const elapsed = Date.now() - stopStartTime;
      const remaining = Math.max(0, (stopDurationMs - elapsed) / 1000);

      this.remainingStopTime = remaining;
      this.notify();

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, updateInterval);

    // Wait for exact stop duration
    await sleep(stopDurationMs);

    // Ensure timer shows exactly 0
    this.remainingStopTime = 0;
    this.isCurrentlyStopping = false;
    this.notify();
  }

  /**
   * Gets the current transition duration for CSS animation.
   * Returns 0 when not moving or during stops.
   */
  getCurrentTransitionDuration(): number {
    if (!this.isMoving || this.isCurrentlyStopping) {
      return 0;
    }
    return this.animationDuration;
  }
}
