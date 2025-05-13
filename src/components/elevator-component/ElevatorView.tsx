import React from "react";
import * as S from "./styled";
import { FLOOR_BORDER_HEIGHT } from "../../constants";

/**
 * ElevatorView component
 * Renders a single elevator inside a track
 * @param elevatorId ID of the elevator
 * @param floorCount number of floors in the building
 * @param position current position of the elevator
 */
interface ElevatorViewProps {
  elevatorId: string;
  floorCount: number;
  position: number;
}

const ElevatorView: React.FC<ElevatorViewProps> = ({
  elevatorId,
  floorCount,
  position,
}) => {
  const floorHeight = 110;
  const offset = 35;

  return (
    <S.ElevatorTrack key={elevatorId} floorCount={floorCount}>
      <S.ElevatorBox
        floorPosition={position}
        duration={0.03}
        floorHeight={floorHeight}
        borderHeight={FLOOR_BORDER_HEIGHT}
        offset={offset}
      />
    </S.ElevatorTrack>
  );
};

export default ElevatorView;
