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
   * Initializes a new building with floors and elevators.
   * @param id Unique building ID
   * @param numberOfFloors Total number of floors in the building
   * @param elevatorIds List of elevator IDs to instantiate
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
   * Chooses the best elevator to handle a call to a given floor.
   * Selection is based on estimated arrival time using current position and remaining stop time.
   * @param floor Target floor number
   * @returns The best elevator and estimated arrival time in seconds
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
   * Triggers an elevator to handle a floor call, and sets up listener to clear call state.
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
        // Clear call only when elevator arrives and stops at the correct floor
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
   * Decrements floor timers.
   * @param deltaSeconds Number of seconds to subtract from each active floor timer
   */
  updateTimers(deltaSeconds: number) {
    this.floors.forEach((floor) => floor.updateTimer(deltaSeconds));
  }

  /**
   * Estimates total time for elevator to reach a requested floor.
   * Time is based on distance, stop durations, and — if currently stopping — the remaining stop time.
   * @param elevator Elevator to evaluate
   * @param floor Target floor number
   * @returns Estimated arrival time in seconds (rounded to 1 decimal place)
   */
  private estimateArrival(elevator: Elevator, floor: number) {
    let time = 0;
    let current = elevator.exactPosition;
    const path = [...elevator.targetFloors];

    // Include target floor if it's not already in the elevator's queue
    if (!path.includes(floor)) path.push(floor);

    const isCurrentlyStopping = elevator.isCurrentlyStopping;

    for (let i = 0; i < path.length; i++) {
      const f = path[i];
      time += Math.abs(current - f) * FLOOR_DURATION;

      // Stop counting when we reach the evaluated target floor
      if (f === floor) break;

      // For the first stop, if elevator is currently stopping, add only the remaining stop time
      if (i === 0 && isCurrentlyStopping) {
        time += elevator.remainingStopTime;
      } else {
        time += STOP_DURATION;
      }

      current = f;
    }

    return Math.round(time * 10) / 10;
  }
}
