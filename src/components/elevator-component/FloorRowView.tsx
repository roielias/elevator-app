import React from "react";
import * as S from "./styled";

/**
 * FloorRowView component
 * Renders a single floor row with timer, call button, and shaft
 * @param floorNumber the number of the floor
 * @param timer current timer value for the floor
 * @param isCalling boolean flag indicating if the floor is calling
 * @param onCall function to handle call button click
 * @param isElevatorHere conditional to check if the elevator is stopping in this floor now
 */
interface FloorRowViewProps {
  floorNumber: number;
  timer: number;
  isCalling: boolean;
  onCall: () => void;
  isElevatorHere: boolean;
}

const FloorRowView: React.FC<FloorRowViewProps> = ({
  floorNumber,
  timer,
  isCalling,
  onCall,
  isElevatorHere,
}) => {
  return (
    <S.FloorRow key={floorNumber}>
      <S.FloorTimerBox>
        {timer > 0 ? `${timer.toFixed(2)}s` : ""}
      </S.FloorTimerBox>

      <S.MetalButton
        $isCalling={isCalling}
        onClick={onCall}
        disabled={isElevatorHere}
      >
        {floorNumber}
      </S.MetalButton>

      <S.Shaft />
    </S.FloorRow>
  );
};

export default FloorRowView;
