/**
 * Represents a floor in a building.
 */
export class Floor {
  number: number; // floor number (index)
  timer: number = 0; // countdown timer until elevator arrives
  isCalling: boolean = false; // whether the floor is currently calling an elevator

  constructor(number: number) {
    this.number = number;
  }

  /**
   * Sets the ETA timer for an elevator arrival
   * @param eta Estimated time in seconds until elevator arrives
   */
  setTimer(eta: number) {
    this.timer = eta;
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
  }

  /**
   * Decrements the timer by a given delta in seconds
   * @param deltaSeconds Time passed since last update
   */
  updateTimer(deltaSeconds: number) {
    if (this.timer > 0) {
      this.timer = Math.max(0, this.timer - deltaSeconds);
    }
  }
}
