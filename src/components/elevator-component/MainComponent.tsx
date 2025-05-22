import React, { useState, useEffect } from "react";
import * as S from "./styled";
import { Building } from "../../classes/building";
import { BuildingFactory } from "../../factory/building.factory";
import BuildingView from "./BuildingView";

/**
 * Config interface for creating multiple buildings
 */
interface BuildingConfig {
  id: string;
  numberOfFloors: number;
  elevatorIds: string[];
}

interface MainComponentProps {
  config: BuildingConfig[];
}

/**
 * MainComponent
 * - Creates building instances based on config
 * - Tracks real-time elevator positions and transition durations
 * - Renders BuildingView components for each building
 */
const MainComponent: React.FC<MainComponentProps> = ({ config }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [elevatorPositions, setElevatorPositions] = useState<
    Record<string, number>
  >({});

  const [elevatorTransitions, setElevatorTransitions] = useState<
    Record<string, number>
  >({});

  /**
   * Initialize buildings and elevators on config change
   */
  useEffect(() => {
    const newBuildings = config.map(({ id, numberOfFloors, elevatorIds }) =>
      BuildingFactory.create(id, numberOfFloors, elevatorIds)
    );
    setBuildings(newBuildings);

    const initialPositions = Object.fromEntries(
      config.flatMap(({ elevatorIds }) => elevatorIds.map((id) => [id, 0]))
    );
    const initialTransitions = Object.fromEntries(
      config.flatMap(({ elevatorIds }) => elevatorIds.map((id) => [id, 0]))
    );

    setElevatorPositions(initialPositions);
    setElevatorTransitions(initialTransitions);
  }, [config]);

  /**
   * Subscribe to elevator updates and track their positions + transition times
   */
  useEffect(() => {
    buildings.forEach((building) => {
      building.elevators.forEach((elevator) => {
        elevator.addListener((updated) => {
          setElevatorPositions((prev) => ({
            ...prev,
            [updated.id]: updated.exactPosition,
          }));
          setElevatorTransitions((prev) => ({
            ...prev,
            [updated.id]: updated.currentTransitionDuration,
          }));
        });
      });
    });
  }, [buildings]);

  /**
   * Periodic update loop for timers (e.g., stop countdown)
   * No need to animate anything – handled by CSS transform
   */
  useEffect(() => {
    const interval = 100; // 100ms is enough for timer updates
    const timer = setInterval(() => {
      setBuildings((prev) => {
        prev.forEach((b) => b.updateTimers(interval / 1000));
        return [...prev];
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  /**
   * Call elevator to specific floor
   */
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
          elevatorTransitions={elevatorTransitions}
          onCall={(floorNumber) => handleCall(building.id, floorNumber)}
        />
      ))}
    </S.Container>
  );
};

export default MainComponent;
