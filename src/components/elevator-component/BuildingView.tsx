import React from "react";
import { Building } from "../../classes/building";
import * as S from "./styled";
import { FLOOR_BORDER_HEIGHT } from "../../constants";

interface BuildingViewProps {
  building: Building;
  elevatorPositions: Record<string, number>;
  onCall: (floorNumber: number) => void;
}

const BuildingView: React.FC<BuildingViewProps> = ({
  building,
  elevatorPositions,
  onCall,
}) => {
  const floorHeight = 110;
  const elevatorHeight = 30;
  const offset = 35;

  return (
    <S.Building key={building.id} floorCount={building.floors.length}>
      <h3>{building.id}</h3>

      {building.elevators.map((elevator) => (
        <S.ElevatorTrack key={elevator.id} floorCount={building.floors.length}>
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
            onClick={() => onCall(floor.number)}
          >
            {floor.number}
          </S.MetalButton>

          <S.Shaft />
        </S.FloorRow>
      ))}
    </S.Building>
  );
};

export default BuildingView;
