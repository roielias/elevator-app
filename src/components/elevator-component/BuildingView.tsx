import React from "react";
import { Building } from "../../classes/building";
import ElevatorView from "./ElevatorView";
import FloorRowView from "./FloorRowView";
import * as S from "./styled";

interface BuildingViewProps {
  building: Building;
  elevatorPositions: Record<string, number>;
  onCall: (floorNumber: number) => void;
}

/**
 * BuildingView component (refactored)
 * Displays the full building using modular ElevatorView and FloorRowView components
 */
const BuildingView: React.FC<BuildingViewProps> = ({
  building,
  elevatorPositions,
  onCall,
}) => {
  return (
    <S.Building key={building.id} $floorCount={building.floors.length}>
      <h3>{building.id}</h3>

      {building.elevators.map((elevator) => (
        <ElevatorView
          key={elevator.id}
          elevatorId={elevator.id}
          floorCount={building.floors.length}
          position={elevatorPositions[elevator.id]}
        />
      ))}

      {[...building.floors].reverse().map((floor) => {
        const isElevatorHere = building.elevators.some(
          (elevator) => elevatorPositions[elevator.id] === floor.number
        );

        return (
          <FloorRowView
            key={floor.number}
            floorNumber={floor.number}
            timer={floor.timer}
            isCalling={floor.isCalling}
            onCall={() => onCall(floor.number)}
            isElevatorHere={isElevatorHere}
          />
        );
      })}
    </S.Building>
  );
};

export default BuildingView;
