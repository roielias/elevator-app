import { Building } from "../classes/building";

export class BuildingFactory {
  static create(id: string, numberOfFloors: number, elevatorIds: string[]) {
    return new Building(id, numberOfFloors, elevatorIds);
  }
}
