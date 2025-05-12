export class Floor {
  number: number;
  timer: number = 0;
  isCalling: boolean = false;

  constructor(number: number) {
    this.number = number;
  }

  setTimer(eta: number) {
    this.timer = eta;
    this.isCalling = true;
  }

  reset() {
    this.timer = 0;
  }

  clearCall() {
    this.isCalling = false;
    this.timer = 0;
  }

  updateTimer(deltaSeconds: number) {
    if (this.timer > 0) {
      this.timer = Math.max(0, this.timer - deltaSeconds);
    }
  }
}
