// building.ts
import { Elevator } from "./elevator";
import { Floor } from "./floor";
import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { FloorFactory } from "../factory/floor.factory";
import { ElevatorFactory } from "../factory/elevator.factory";

/**
 * Represents a building containing floors and elevators.
 */
export class Building {
  id: string;
  elevators: Elevator[] = [];
  floors: Floor[] = [];

  /**
   * Initializes a new building instance
   * @param id Unique building identifier
   * @param numberOfFloors Number of floors in the building
   * @param elevatorIds Array of elevator IDs to create elevators
   */
  constructor(id: string, numberOfFloors: number, elevatorIds: string[]) {
    this.id = id;
    this.floors = [...Array(numberOfFloors)].map((_, i) =>
      FloorFactory.create(i)
    );
    this.elevators = elevatorIds.map((id) => {
      const elevator = ElevatorFactory.create(id);
      elevator.exactPosition = 0;
      return elevator;
    });
  }

  /**
   * Selects the best elevator for a requested floor based on estimated arrival time.
   * @param floor Target floor number
   * @returns The best elevator and estimated arrival time
   */
  selectElevator(floor: number) {
    let best = this.elevators[0];
    let bestTime = this.estimateArrival(best, floor);
    for (let i = 1; i < this.elevators.length; i++) {
      const t = this.estimateArrival(this.elevators[i], floor);
      if (t < bestTime) {
        best = this.elevators[i];
        bestTime = t;
      }
    }

    return { best, eta: bestTime };
  }

  /**
   * Handles an elevator call from a specific floor
   * @param floorNumber The floor number where the call originates
   */
  handleCall(floorNumber: number) {
    const { best, eta } = this.selectElevator(floorNumber);
    const floor = this.floors.find((f) => f.number === floorNumber);
    if (floor && !floor.isCalling) {
      floor.setTimer(eta);
      best.addTarget(floor.number);
      best.start();
      const remove = best.addListener((elevator) => {
        // Check if elevator is currently at this floor AND it's currently stopping
        // AND either this is the current target or we've just finished processing targets
        if (
          elevator.currentFloor === floor.number &&
          elevator.isCurrentlyStopping &&
          (elevator.targetFloors[0] === floor.number ||
            elevator.targetFloors.length === 0)
        ) {
          floor.clearCall();
          remove();
        }
      });
    }
  }

  /**
   * Updates the timer on all floors
   * @param deltaSeconds Time delta in seconds to decrement from floor timers
   */
  updateTimers(deltaSeconds: number) {
    this.floors.forEach((floor) => floor.updateTimer(deltaSeconds));
  }

  /**
   * Estimates the time (in seconds) it will take for a given elevator to arrive at a floor
   * @param elevator Elevator to evaluate
   * @param floor Target floor number
   * @returns Estimated time in seconds
   */
  private estimateArrival(elevator: Elevator, floor: number) {
    let time = 0;
    let current = elevator.exactPosition;
    const path = [...elevator.targetFloors];

    if (!path.includes(floor)) path.push(floor);

    const isCurrentlyStopping =
      elevator.targetFloors.length > 0 &&
      elevator.currentFloor === elevator.targetFloors[0] &&
      elevator.isCurrentlyStopping;

    if (isCurrentlyStopping) {
      time += STOP_DURATION;
    }

    for (let i = 0; i < path.length; i++) {
      const f = path[i];
      time += Math.abs(current - f) * FLOOR_DURATION;

      // Only add stop duration for floors that are before our target floor
      if (f === floor) break;

      // Add stop time for intermediate floors
      time += STOP_DURATION;
      current = f;
    }

    return Math.ceil(time);
  }
}
