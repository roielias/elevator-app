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
<<<<<<< HEAD
   * Estimates the total time (in seconds) for an elevator to reach a requested floor.
   * Accounts for current elevator state (stopping/moving), queue order, and realistic travel & stop durations.
   *
   * @param elevator - The elevator instance being evaluated.
   * @param floor - The requested destination floor.
   * @returns Estimated time to arrival, rounded to 1 decimal place.
=======
   * Estimates total time for elevator to reach a requested floor.
   * Uses existing floor timers to get accurate remaining time for active calls.
   * @param elevator Elevator to evaluate
   * @param floor Target floor number
   * @returns Estimated arrival time in seconds (rounded to 1 decimal place)
>>>>>>> a5c1ad0a546a93ab22f266b1f7f2ff30257cc538
   */
  private estimateArrival(elevator: Elevator, floor: number): number {
    let time = 0;
    let currentPosition = elevator.exactPosition;
    const targetFloors = [...elevator.targetFloors];

    // Add the requested floor to the path if not already present
    if (!targetFloors.includes(floor)) {
      targetFloors.push(floor);
    }

<<<<<<< HEAD
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
=======
    // Find the maximum remaining time from all floors that are currently calling this elevator
    // This gives us the time until the elevator finishes all its current commitments
    let maxExistingTimer = 0;
    this.floors.forEach((f) => {
      if (f.isCalling && f.timer > maxExistingTimer) {
        // Check if this floor is in the elevator's target list
        if (elevator.targetFloors.includes(f.number)) {
          maxExistingTimer = f.timer;
        }
      }
    });

    // If there are existing timers, use the maximum one as base time
    if (maxExistingTimer > 0) {
      time = maxExistingTimer;

      // Find what floor corresponds to this max timer
      const lastTargetFloor = this.floors.find(
        (f) =>
          f.isCalling &&
          f.timer === maxExistingTimer &&
          elevator.targetFloors.includes(f.number)
      );

      if (lastTargetFloor) {
        current = lastTargetFloor.number;

        // If our target floor is not already in the path, add stop time + travel time
        if (!elevator.targetFloors.includes(floor)) {
          // Add stop duration at the last target floor
          time += STOP_DURATION;
          // Add travel time from the last target to our new target
          time += Math.abs(current - floor) * FLOOR_DURATION;
        }
      }
    } else {
      // No existing timers, calculate from current position
      const isCurrentlyStopping = elevator.isCurrentlyStopping;

      // If elevator is currently stopping, add remaining stop time
      if (isCurrentlyStopping) {
        time += elevator.remainingStopTime;
      }

      // Process all floors in the path
      for (let i = 0; i < path.length; i++) {
        const f = path[i];
        time += Math.abs(current - f) * FLOOR_DURATION;

        // Stop counting when we reach the evaluated target floor
        if (f === floor) break;

        // Add stop duration for intermediate floors
        time += STOP_DURATION;
        current = f;
      }
>>>>>>> a5c1ad0a546a93ab22f266b1f7f2ff30257cc538
    }

    return Math.round(time * 10) / 10;
  }
}
