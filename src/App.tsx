import React, { useState } from "react";
import "./App.css";
import ElevatorComponent from "./components/elevator-component/MainComponent";
import SettingsModal from "./components/setting-modal/settingModal";
import styled from "styled-components";

type BuildingConfig = {
  id: string;
  numberOfFloors: number;
  elevatorIds: string[];
};

function App() {
  const [showSettings, setShowSettings] = useState(true);
  const [buildingConfig, setBuildingConfig] = useState<BuildingConfig[]>([]);

  return (
    <div className="App">
      <TopBar>
        <button onClick={() => setShowSettings(true)}>⚙️ Settings</button>
      </TopBar>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSubmit={(config) => {
            setBuildingConfig(config);
            setShowSettings(false);
          }}
        />
      )}

      <ElevatorComponent config={buildingConfig} />
    </div>
  );
}

export default App;

const TopBar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 999;
`;
