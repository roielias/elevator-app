import React, { useState, useEffect } from "react";
import * as S from "./styled";
import { Building } from "../../classes/Building";
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
 * - Tracks elevator positions and transition durations for CSS animations
 * - Uses optimized update intervals for better performance
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

    // Initialize position and transition tracking
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
   * Subscribe to elevator updates for position and transition tracking
   * This replaces the old frequent position updates with event-driven updates
   */
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    buildings.forEach((building) => {
      building.elevators.forEach((elevator) => {
        const cleanup = elevator.addListener((updated) => {
          // Update position for CSS transition
          setElevatorPositions((prev) => ({
            ...prev,
            [updated.id]: updated.exactPosition,
          }));

          // Update transition duration for CSS animation timing
          setElevatorTransitions((prev) => ({
            ...prev,
            [updated.id]: updated.getCurrentTransitionDuration(),
          }));
        });
        cleanupFunctions.push(cleanup);
      });
    });

    // Cleanup listeners on unmount or buildings change
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [buildings]);

  /**
   * Timer update loop for floor countdowns
   * Uses precise timing calculation instead of accumulated intervals
   */
  useEffect(() => {
    const updateInterval = 50; // 50ms for smooth timer display
    let lastUpdateTime = Date.now();

    const timer = setInterval(() => {
      const currentTime = Date.now();
      const deltaSeconds = (currentTime - lastUpdateTime) / 1000;
      lastUpdateTime = currentTime;

      setBuildings((prevBuildings) => {
        // Update floor timers with precise delta
        prevBuildings.forEach((building) => {
          building.updateTimers(deltaSeconds);
        });

        // Return new array reference to trigger re-render
        return [...prevBuildings];
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [buildings]);

  /**
   * Handles elevator call for a specific building and floor
   * @param buildingId ID of the building
   * @param floorNumber Target floor number
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
