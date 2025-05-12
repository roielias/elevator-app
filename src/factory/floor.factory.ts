import { Floor } from "../classes/floor";

export class FloorFactory {
  static create(number: number): Floor {
    return new Floor(number);
  }
}
