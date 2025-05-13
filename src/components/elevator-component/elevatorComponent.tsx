import React, { useState, useEffect } from "react";
import * as S from "./styled";
import { FLOOR_BORDER_HEIGHT } from "../../constants";
import { Building } from "../../classes/building";
import { BuildingFactory } from "../../factory/building.factory";

interface BuildingConfig {
  id: string;
  numberOfFloors: number;
  elevatorIds: string[];
}

interface ElevatorComponentProps {
  config: BuildingConfig[];
}

/**
 * Main elevator simulation component
 * @param config array of building configurations (id, number of floors, elevator IDs)
 */
const ElevatorComponent: React.FC<ElevatorComponentProps> = ({ config }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [elevatorPositions, setElevatorPositions] = useState<
    Record<string, number>
  >({});

  // Initialize buildings and elevators
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

  // Subscribe to elevator position updates
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

  // Update floor timers every 100ms
  useEffect(() => {
    const interval = 100;
    const timer = setInterval(() => {
      setBuildings((prev) => {
        prev.forEach((b) => b.updateTimers(interval / 1000));
        return [...prev];
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  /**
   * Handles call button press for a specific building and floor
   * @param buildingId ID of the building
   * @param floorNumber number of the floor
   */
  const handleCall = (buildingId: string, floorNumber: number) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      building.handleCall(floorNumber);
    }
  };

  const floorHeight = 110;
  const elevatorHeight = 30;
  const offset = 35; // vertical adjustment to center the elevator visually

  return (
    <S.Container>
      <S.Controls />
      {buildings.map((building) => (
        <S.Building key={building.id} floorCount={building.floors.length}>
          <h3>{building.id}</h3>

          {building.elevators.map((elevator) => (
            <S.ElevatorTrack
              key={elevator.id}
              floorCount={building.floors.length}
            >
              <S.ElevatorBox
                floorPosition={elevatorPositions[elevator.id]}
                duration={0.03}
                floorHeight={floorHeight}
                borderHeight={FLOOR_BORDER_HEIGHT}
                offset={offset}
              />
            </S.ElevatorTrack>
          ))}

          {[...building.floors].reverse().map((floor) => (
            <S.FloorRow key={floor.number}>
              <S.FloorTimerBox>
                {floor.timer > 0 ? `${floor.timer.toFixed(2)}s` : ""}
              </S.FloorTimerBox>

              <S.MetalButton
                isCalling={floor.isCalling}
                onClick={() => handleCall(building.id, floor.number)}
              >
                {floor.number}
              </S.MetalButton>

              <S.Shaft />
            </S.FloorRow>
          ))}
        </S.Building>
      ))}
    </S.Container>
  );
};

export default ElevatorComponent;
