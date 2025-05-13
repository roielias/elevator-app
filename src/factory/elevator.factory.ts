import { Elevator } from "../classes/elevator";

/**
 * Factory for creating Elevator instances
 */
export class ElevatorFactory {
  /**
   * Creates a new elevator with the given ID
   * @param id Unique identifier for the elevator
   * @returns Elevator instance
   */
  static create(id: string): Elevator {
    return new Elevator(id);
  }
}
