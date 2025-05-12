// building.ts
import { Elevator } from "./elevator";
import { Floor } from "./floor";
import { FLOOR_DURATION, STOP_DURATION } from "../constants";
import { FloorFactory } from "../factory/floor.factory";
import { ElevatorFactory } from "../factory/elevator.factory";

export class Building {
  id: string;
  elevators: Elevator[] = [];
  floors: Floor[] = [];

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

  handleCall(floorNumber: number) {
    const { best, eta } = this.selectElevator(floorNumber);
    const floor = this.floors.find((f) => f.number === floorNumber);
    if (floor && floor.timer === 0) {
      floor.setTimer(eta);
      best.addTarget(floor.number);
      best.start();
      const remove = best.addListener((elevator) => {
        if (elevator.currentFloor === floor.number) {
          floor.clearCall();
          remove();
        }
      });
    }
  }

  updateTimers(deltaSeconds: number) {
    this.floors.forEach((floor) => floor.updateTimer(deltaSeconds));
  }

  private estimateArrival(elevator: Elevator, floor: number) {
    let time = 0;
    let current = elevator.exactPosition;
    const path = [...elevator.targetFloors];

    if (!path.includes(floor)) path.push(floor);

    const isCurrentlyStopping =
      elevator.targetFloors.length > 0 &&
      elevator.currentFloor === elevator.targetFloors[0] &&
      elevator.isMoving;

    if (isCurrentlyStopping) {
      time += STOP_DURATION;
    }

    for (let i = 0; i < path.length; i++) {
      const f = path[i];
      time += Math.abs(current - f) * FLOOR_DURATION;
      if (f === floor) break;
      time += STOP_DURATION;
      current = f;
    }

    return Math.ceil(time);
  }
}
