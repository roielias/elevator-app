import React, { useState, useEffect } from "react";
import * as S from "./styled";
import { Building } from "../../classes/building";
import { BuildingFactory } from "../../factory/building.factory";
import BuildingView from "./BuildingView";

interface BuildingConfig {
  id: string;
  numberOfFloors: number;
  elevatorIds: string[];
}

interface MainComponentProps {
  config: BuildingConfig[];
}

/**
 * MainComponent:
 * - Creates building instances based on config
 * - Manages elevator positions state
 * - Renders BuildingView components with up-to-date info
 */
const MainComponent: React.FC<MainComponentProps> = ({ config }) => {
  // State holding building instances
  const [buildings, setBuildings] = useState<Building[]>([]);

  // State mapping elevator IDs to their current positions
  const [elevatorPositions, setElevatorPositions] = useState<
    Record<string, number>
  >({});

  // Initialize buildings and elevator positions on config change
  useEffect(() => {
    const newBuildings = config.map(({ id, numberOfFloors, elevatorIds }) =>
      BuildingFactory.create(id, numberOfFloors, elevatorIds)
    );
    setBuildings(newBuildings);

    const initialPositions = Object.fromEntries(
      config.flatMap(({ elevatorIds }) => elevatorIds.map((id) => [id, 0]))
    );
    setElevatorPositions(initialPositions);
  }, [config]);

  // Subscribe to elevator position updates and update state accordingly
  useEffect(() => {
    buildings.forEach((building) => {
      building.elevators.forEach((el) => {
        el.addListener((updated) => {
          setElevatorPositions((prev) => ({
            ...prev,
            [updated.id]: updated.exactPosition,
          }));
        });
      });
    });
  }, [buildings]);

  // Periodically update timers for all buildings (e.g. elevator movements)
  useEffect(() => {
    const interval = 100; // ms
    const timer = setInterval(() => {
      setBuildings((prev) => {
        prev.forEach((b) => b.updateTimers(interval / 1000));
        return [...prev];
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Handler for calling elevator in a specific building and floor
  const handleCall = (buildingId: string, floorNumber: number) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      building.handleCall(floorNumber);
    }
  };

  return (
    <S.Container>
      <S.Controls />
      {buildings.map((building) => (
        <BuildingView
          key={building.id}
          building={building}
          elevatorPositions={elevatorPositions}
          onCall={(floorNumber: number) => handleCall(building.id, floorNumber)}
        />
      ))}
    </S.Container>
  );
};

export default MainComponent;
