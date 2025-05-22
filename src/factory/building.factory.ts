import { Building } from "../classes/Building";

/**
 * Factory for creating Building instances
 */
export class BuildingFactory {
  /**
   * Creates a new building
   * @param id Unique identifier for the building
   * @param numberOfFloors Number of floors in the building
   * @param elevatorIds List of elevator IDs to initialize with
   * @returns Building instance
   */
  static create(id: string, numberOfFloors: number, elevatorIds: string[]) {
    return new Building(id, numberOfFloors, elevatorIds);
  }
}
