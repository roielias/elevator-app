import styled, { keyframes, css } from "styled-components";
import elvImg from "../../assets/elv.png";

/**
 * Utility to calculate the bottom offset in pixels
 * based on floor number, height, and optional offset.
 */
const computeBottom = (
  floorPosition: number,
  floorHeight: number,
  offset: number
) => {
  const value = floorPosition * floorHeight + offset;
  return `${Math.round(value)}px`;
};

/** Main container for all buildings */
export const Container = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 20px;
  font-family: sans-serif;
  align-items: flex-end;
  min-height: 100vh;
  padding-bottom: 20px;
`;

/** Single building wrapper (visual block) */
export const Building = styled.div<{ $floorCount: number }>`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-end;
  width: 300px;
  border: 2px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
  position: relative;
  box-sizing: border-box;
  overflow-y: visible;
  flex-shrink: 0;
`;

/** One horizontal row = a floor with label, button, and shaft */
export const FloorRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 30px;
  align-items: center;
  height: 110px;
  flex-shrink: 0;
  position: relative;
  border-bottom: 7px solid black;
  padding: 0 10px;
  background-color: silver;
  background-image: linear-gradient(335deg, #b00 23px, transparent 23px),
    linear-gradient(155deg, #d00 23px, transparent 23px),
    linear-gradient(335deg, #b00 23px, transparent 23px),
    linear-gradient(155deg, #d00 23px, transparent 23px);
  background-size: 58px 58px;
  background-position: 0px 2px, 4px 35px, 29px 31px, 34px 6px;
  width: 100%;
  box-sizing: border-box;
`;

/** Displays remaining stop time in floor row */
export const FloorTimerBox = styled.div`
  width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: black;
  border: 2px solid black;
  border-radius: 4px;
`;

/** Wrapper for the call button in the floor row */
export const CallButtonWrapper = styled.div`
  margin: 0 10px;
`;

/** Label showing floor number */
export const FloorLabel = styled.div`
  width: 80px;
  text-align: right;
  margin-right: 10px;
  font-weight: bold;
`;

/**
 * Elevator shaft container (the vertical rail)
 * Positioned from bottom so elevator uses bottom offset.
 */
export const ElevatorTrack = styled.div<{ $floorCount: number }>`
  position: absolute;
  right: 20px;
  width: 30px;
  height: ${({ $floorCount }) => $floorCount * 110}px;
  z-index: 10;
  pointer-events: none;
  bottom: 0;
  max-height: 100%;
`;

/**
 * ElevatorBox with CSS transition-based animation
 * Uses linear timing function for consistent speed matching FLOOR_DURATION constant
 */
export const ElevatorBox = styled.div<{
  $floorPosition?: number;
  $duration: number;
  $floorHeight: number;
  $offset?: number;
}>`
  position: absolute;
  width: 30px;
  height: 30px;
  background-image: url(${elvImg});
  background-size: cover;
  background-position: center;
  border-radius: 5px;

  /* CSS transition for smooth, accurate movement */
  transition: ${({ $duration }) =>
    $duration > 0 ? `bottom ${$duration}s linear` : "none"};

  bottom: ${({ $floorPosition, $floorHeight, $offset }) =>
    $floorPosition !== undefined
      ? computeBottom($floorPosition, $floorHeight, $offset ?? 0)
      : "0px"};
`;

/** Container for all UI controls (if any) */
export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

/** Represents the shaft between elevator and floor rows */
export const Shaft = styled.div`
  width: 30px;
  height: 100%;
  background-color: #ccc;
`;

/**
 * Stylized round metal button for each floor
 * @variant radial for large mode
 * @isCalling for active state
 */
export const MetalButton = styled.button<{
  variant?: "radial" | "linear";
  $isCalling?: boolean;
}>`
  position: relative;
  margin: 5px auto;
  outline: none;
  font: bold 1.5em "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif;
  text-align: center;
  color: hsla(0, 0%, 20%, 1);
  text-shadow: hsla(0, 0%, 40%, 0.5) 0 -1px 0, hsla(0, 0%, 100%, 0.6) 0 2px 1px;
  background-color: ${({ $isCalling }) =>
    $isCalling ? "limegreen" : "hsl(0, 0%, 90%)"};
  box-shadow: inset hsla(0, 0%, 15%, 1) 0 0px 0px 4px,
    inset hsla(0, 0%, 15%, 0.8) 0 -1px 5px 4px,
    inset hsla(0, 0%, 0%, 0.25) 0 -1px 0px 7px,
    inset hsla(0, 0%, 100%, 0.7) 0 2px 1px 7px,
    hsla(0, 0%, 0%, 0) 0 -5px 6px 4px, hsla(0, 0%, 100%, 0) 0 5px 6px 4px;
  transition: background-color 0.3s;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  cursor: pointer;
  border: none;

  ${({ variant }) =>
    variant === "radial" &&
    css`
      width: 160px;
      height: 160px;
      line-height: 160px;
      border-radius: 80px;
      background-image: -webkit-radial-gradient(
        50% 0%,
        8% 50%,
        hsla(0, 0%, 100%, 0.5) 0%,
        hsla(0, 0%, 100%, 0) 100%
      );
    `}

  &:disabled {
    cursor: not-allowed;
  }
`;
