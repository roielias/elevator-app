// building.ts
import { Elevator } from "./Elevator";
import { Floor } from "./Floor";
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

      // Store start time for synchronized countdown
      const startTime = Date.now();
      floor.startTime = startTime;
      floor.originalEta = eta;

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
   * Updates floor timers with synchronized countdown
   * @param deltaSeconds Number of seconds to subtract from each active floor timer
   */
  updateTimers(deltaSeconds: number) {
    this.floors.forEach((floor) => {
      if (floor.isCalling) {
        // If floor has synchronized start time, use real elapsed time
        if (floor.startTime && floor.originalEta) {
          const elapsed = (Date.now() - floor.startTime) / 1000;
          const remaining = Math.max(0, floor.originalEta - elapsed);
          floor.timer = Math.round(remaining * 100) / 100;
        } else {
          // Fallback to regular delta updates
          floor.updateTimer(deltaSeconds);
        }
      }
    });
  }

  /**
   * Estimates the total time (in seconds) for an elevator to reach a requested floor.
   * Accounts for current elevator state (stopping/moving), queue order, and realistic travel & stop durations.
   *
   * @param elevator - The elevator instance being evaluated.
   * @param floor - The requested destination floor.
   * @returns Estimated time to arrival, rounded to 1 decimal place.
   */
  private estimateArrival(elevator: Elevator, floor: number): number {
    let time = 0;
    let currentPosition = elevator.exactPosition;
    const targetFloors = [...elevator.targetFloors];

    // Add the requested floor to the path if not already present
    if (!targetFloors.includes(floor)) {
      targetFloors.push(floor);
    }

    // Handle case where elevator is currently stopping
    if (elevator.isCurrentlyStopping) {
      time += elevator.remainingStopTime;
      currentPosition = Math.floor(elevator.exactPosition); // Normalize position to integer floor
    }

    // Handle case where elevator is in motion and has a first target
    else if (elevator.isMoving && targetFloors.length > 0) {
      const nextFloor = targetFloors[0];
      const floorObj = this.floors.find((f) => f.number === nextFloor);
      if (floorObj && floorObj.timer > 0) {
        time += floorObj.timer; // Use real-time ETA if available
        currentPosition = nextFloor;
        time += STOP_DURATION; // Account for planned stop at next floor
        targetFloors.shift(); // Remove already-handled target
      }
    }

    // Simulate remaining path
    for (const targetFloor of targetFloors) {
      if (currentPosition === targetFloor) {
        continue; // Skip redundant move to current position
      }

      const travelTime =
        Math.abs(currentPosition - targetFloor) * FLOOR_DURATION;
      time += travelTime;
      currentPosition = targetFloor;

      if (targetFloor === floor) {
        break; // Stop once requested floor is reached
      }

      time += STOP_DURATION; // Include stop time for intermediate floors
    }

    return Math.round(time * 10) / 10;
  }
}
