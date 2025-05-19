import React, { useState } from "react";
import * as S from "./styled";

/**
 * Represents the configuration for a single building
 * - floors: number of floors the user selected
 * - elevators: number of elevators in the building
 */
interface BuildingSettings {
  floors: number;
  elevators: number;
}

/**
 * Props for the SettingsModal component
 * - onSubmit: function that receives the final configuration to start the simulation
 * - onClose: function to close the modal
 */
interface SettingsModalProps {
  onSubmit: (
    config: { id: string; numberOfFloors: number; elevatorIds: string[] }[]
  ) => void;
  onClose: () => void;
}

/**
 * A modal component that lets the user configure how many buildings,
 * how many floors in each, and how many elevators.
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ onSubmit, onClose }) => {
  const [numBuildings, setNumBuildings] = useState(1); // total number of buildings
  const [buildings, setBuildings] = useState<BuildingSettings[]>([
    { floors: 5, elevators: 1 },
  ]); // array of building settings

  // Updates the number of buildings and keeps existing settings where possible
  const handleNumBuildingsChange = (n: number) => {
    setNumBuildings(n);
    const updated = Array.from(
      { length: n },
      (_, i) => buildings[i] || { floors: 5, elevators: 1 }
    );
    setBuildings(updated);
  };

  // Updates floors/elevators for a specific building
  const handleChange = (
    index: number,
    key: "floors" | "elevators",
    value: number
  ) => {
    const updated = [...buildings];
    updated[index][key] = value;
    setBuildings(updated);
  };

  // Builds the configuration array and submits it to the parent component
  const handleSubmit = () => {
    const config = buildings.map((b, i) => ({
      id: `Building-${i + 1}`,
      numberOfFloors: b.floors + 1, // includes ground floor
      elevatorIds: Array.from(
        { length: b.elevators },
        (_, j) => `B${i + 1}-E${j + 1}`
      ),
    }));
    onSubmit(config);
    onClose();
  };

  return (
    <S.Overlay>
      <S.Modal>
        <h2>Building Settings</h2>

        <label>How many buildings?</label>
        <input
          type="number"
          min={1}
          max={10}
          value={numBuildings}
          onChange={(e) =>
            handleNumBuildingsChange(parseInt(e.target.value, 10) || 1)
          }
        />

        {/* Render floor/elevator selectors for each building */}
        {buildings.map((b, i) => (
          <S.Row key={i}>
            <label>Building {i + 1}:</label>
            <select
              value={b.floors}
              onChange={(e) =>
                handleChange(i, "floors", parseInt(e.target.value, 10))
              }
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} floors
                </option>
              ))}
            </select>
            <select
              value={b.elevators}
              onChange={(e) =>
                handleChange(i, "elevators", parseInt(e.target.value, 10))
              }
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} elevators
                </option>
              ))}
            </select>
          </S.Row>
        ))}

        {/* Final action buttons */}
        <button onClick={handleSubmit}>Start Simulation</button>
        <button onClick={onClose}>Cancel</button>
      </S.Modal>
    </S.Overlay>
  );
};

export default SettingsModal;
