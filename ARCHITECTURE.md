# 🧠 Architecture & Algorithm Explanation

## Architecture Overview

This project is built using a modular object-oriented architecture. Each major domain entity — such as `Elevator`, `Floor`, and `Building` — is implemented as a TypeScript class with encapsulated behavior and state.

Key architectural components:
- **Classes**: Domain logic is separated from UI and managed via TypeScript classes.
- **Factories**: All objects are instantiated using dedicated factory functions, adhering to the Factory design pattern.
- **Event System (Observer)**: Elevators expose a listener mechanism allowing UI updates to reflect changes in real time.
- **React Components**: The UI is built with reusable functional components, styled via `styled-components`, and updated using React Hooks.
- **Multiple Buildings Support**: The system supports any number of buildings, each with isolated elevators and floors, managed independently.

## Main Algorithm Explanation

The elevator scheduling logic works as follows:
1. When a floor button is pressed, a call is issued to the building.
2. The building searches for the optimal elevator based on:
   - If it is idle or already moving toward the calling floor.
   - The estimated arrival time (distance in floors).
3. The selected elevator adds the floor to its target queue.
4. The elevator animates its movement over time (0.5s per floor).
5. Once it reaches the target floor:
   - It plays a sound (`ding.mp3`)
   - Waits for 2 seconds
   - Clears the call from the floor

Each elevator notifies subscribed UI components about position/state updates, enabling smooth animation and ETA display.