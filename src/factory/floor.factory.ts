import { Floor } from "../classes/Floor";

/**
 * Factory for creating Floor instances
 */
export class FloorFactory {
  /**
   * Creates a new floor with the given number
   * @param number Floor index or number
   * @returns Floor instance
   */
  static create(number: number): Floor {
    return new Floor(number);
  }
}
