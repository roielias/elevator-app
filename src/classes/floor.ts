/**
 * Represents a floor in a building.
 */
export class Floor {
  number: number; // floor number (index)
  timer: number = 0; // countdown timer until elevator arrives
  isCalling: boolean = false; // whether the floor is currently calling an elevator
  startTime?: number; // timestamp when elevator call started
  originalEta?: number; // original estimated arrival time

  constructor(number: number) {
    this.number = number;
  }

  /**
   * Sets the ETA timer for an elevator arrival
   * @param eta Estimated time in seconds until elevator arrives
   */
  setTimer(eta: number) {
    this.timer = Math.round(eta * 100) / 100; // Round to 2 decimal places
    this.isCalling = true;
  }

  /**
   * Resets the timer to zero (without clearing call status)
   */
  reset() {
    this.timer = 0;
  }

  /**
   * Clears the elevator call and resets timer
   */
  clearCall() {
    this.isCalling = false;
    this.timer = 0;
    this.startTime = undefined;
    this.originalEta = undefined;
  }

  /**
   * Decrements the timer by a given delta in seconds
   * @param deltaSeconds Time passed since last update
   */
  updateTimer(deltaSeconds: number) {
    if (this.timer > 0) {
      this.timer = Math.max(
        0,
        Math.round((this.timer - deltaSeconds) * 100) / 100
      );
    }
  }

  /**
   * Sets the timer to a specific value (used for synchronized updates)
   * @param value New timer value
   */
  setTimerValue(value: number) {
    this.timer = Math.max(0, Math.round(value * 100) / 100);
  }
}
