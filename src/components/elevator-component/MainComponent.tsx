import React, { useState, useEffect } from "react";
import * as S from "./styled";
import { FLOOR_BORDER_HEIGHT } from "../../constants";
import { Building } from "../../classes/building";
import { BuildingFactory } from "../../factory/building.factory";
import BuildingView from "./BuildingView";

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
    const interval = 100;
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

export default ElevatorComponent;
