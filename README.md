# Elevator Simulation App

This is a React + TypeScript simulation of an elevator system with building configuration, animated elevator movement, and audio alerts on arrival.

## 📌 Features

- Multiple buildings and elevators
- Per-floor call buttons with live ETA timers (with decimal seconds)
- Smooth elevator animation between floors
- Audio feedback when elevator arrives at a floor
- Call button changes color when elevator is on its way
- Settings modal to define number of buildings, floors, and elevators
- Clean architecture using Factory and Observer design patterns

## 🧱 Design Patterns Used

This project applies several design patterns to improve code structure:

- **Factory Pattern**: Used for creating `Building`, `Elevator`, and `Floor` instances via dedicated factories.
- **Observer Pattern**: Each elevator allows listeners (subscribers) to react to state changes.
- **Singleton** _(planned or optionally used)_: Suitable for global utilities such as logger or shared services.

These patterns help maintain separation of concerns and simplify extensibility.

## 🚀 Getting Started

### 📦 Installation

```bash
npm install
```

### ▶️ Run the App

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── assets/            # Static files (e.g., elevator image, sound)
├── classes/           # Elevator, Floor, Building logic
├── factory/           # Factory classes for object creation
├── components/        # UI components
│   ├── elevator-component/
│   └── setting/
├── constants.ts       # Global constants like durations and sizes
├── utils.ts           # Helper utilities (e.g., sleep)
├── App.tsx            # Main entry point
└── index.tsx          # React bootstrap
```

## ⚙️ Customization

- Change elevator/floor parameters via the settings modal on app load or by clicking the gear icon (⚙️) later.
- You can adjust constants (speed, stop duration, etc.) in `src/constants.ts`.

## 🔊 Notes

- Audio only plays after user interaction due to browser policies.
- Works best in Chromium-based browsers.

## 🪪 License

This project is open-source and free to use for educational and non-commercial purposes.
