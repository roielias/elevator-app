import React from "react";
import * as S from "./styled";

/**
 * ElevatorView component
 * Displays a single elevator inside its vertical shaft.
 * Props:
 * - elevatorId: unique ID for the elevator
 * - floorCount: total number of floors in the building
 * - position: current vertical position of the elevator (can be float)
 * - transitionDuration: duration (in seconds) for the transition animation
 */
interface ElevatorViewProps {
  elevatorId: string;
  floorCount: number;
  position: number;
  transitionDuration?: number;
}

const ElevatorView: React.FC<ElevatorViewProps> = ({
  elevatorId,
  floorCount,
  position,
  transitionDuration = 0,
}) => {
  const floorHeight = 110; // Height of a single floor in pixels
  const offset = 35; // Additional offset for precise positioning

  return (
    <S.ElevatorTrack key={elevatorId} $floorCount={floorCount}>
      <S.ElevatorBox
        $floorPosition={position}
        $duration={transitionDuration}
        $floorHeight={floorHeight}
        $offset={offset}
      />
    </S.ElevatorTrack>
  );
};

export default ElevatorView;
