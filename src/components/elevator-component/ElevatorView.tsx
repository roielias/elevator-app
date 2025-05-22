import React from "react";
import * as S from "./styled";

/**
 * ElevatorView component
 * Displays a single elevator with CSS transition-based animation.
 * The transition duration and position are controlled by the elevator's state.
 */
interface ElevatorViewProps {
  elevatorId: string;
  floorCount: number;
  position: number; // Target position for CSS transition
  transitionDuration: number; // Duration in seconds for smooth transition
}

const ElevatorView: React.FC<ElevatorViewProps> = ({
  elevatorId,
  floorCount,
  position,
  transitionDuration,
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
