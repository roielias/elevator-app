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

const ElevatorComponent: React.FC<ElevatorComponentProps> = ({ config }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [elevatorPositions, setElevatorPositions] = useState<
    Record<string, number>
  >({});

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

  useEffect(() => {
    const interval = 100; // 100 milliseconds
    const timer = setInterval(() => {
      setBuildings((prev) => {
        prev.forEach((b) => b.updateTimers(interval / 1000));
        return [...prev];
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const handleCall = (buildingId: string, floorNumber: number) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      building.handleCall(floorNumber);
    }
  };

  const floorHeight = 110; // Full height of a floor row including border
  const elevatorHeight = 30; // Height of the elevator image (used for centering)
  const visibleFloorHeight = floorHeight - FLOOR_BORDER_HEIGHT;
  // Calculate the vertical offset to center the elevator (30px tall) inside the visible part of the floor (floorHeight - border)
  // This ensures the elevator is visually centered within each floor row
  const offset = visibleFloorHeight / 2 - elevatorHeight / 2;

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
