import { Elevator } from "../classes/elevator";

export class ElevatorFactory {
  static create(id: string): Elevator {
    return new Elevator(id);
  }
}
