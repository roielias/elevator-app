import React from "react";
import { Building } from "../../classes/Building";
import ElevatorView from "./ElevatorView";
import FloorRowView from "./FloorRowView";
import * as S from "./styled";

/**
 * BuildingView component
 * Displays a single building layout including elevators and floors.
 * Props:
 * - building: instance containing elevator and floor data
 * - elevatorPositions: real-time positions of each elevator (float)
 * - elevatorTransitions: transition durations for smooth animation (seconds)
 * - onCall: function to trigger an elevator call to a floor
 */
interface BuildingViewProps {
  building: Building;
  elevatorPositions: Record<string, number>;
  elevatorTransitions: Record<string, number>;
  onCall: (floorNumber: number) => void;
}

const BuildingView: React.FC<BuildingViewProps> = ({
  building,
  elevatorPositions,
  elevatorTransitions,
  onCall,
}) => {
  return (
    <S.Building key={building.id} $floorCount={building.floors.length}>
      <h3>{building.id}</h3>

      {/* Render each elevator with its position and animation duration */}
      {building.elevators.map((elevator) => (
        <ElevatorView
          key={elevator.id}
          elevatorId={elevator.id}
          floorCount={building.floors.length}
          position={elevatorPositions[elevator.id]}
          transitionDuration={elevatorTransitions[elevator.id] || 0}
        />
      ))}

      {/* Render each floor, top-down */}
      {[...building.floors].reverse().map((floor) => {
        const isElevatorHere = building.elevators.some(
          (elevator) =>
            Math.round(elevatorPositions[elevator.id]) === floor.number
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
