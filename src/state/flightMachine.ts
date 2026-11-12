/**
 * Flight state machine (ADR-2).
 * Pure functions over the store — no GSAP coupling here so it stays testable.
 */
import type { FlightState, PlanetId } from './useStore';
import { FLIGHT_DURATION_MS } from '@/config/site';

export type FlightEvent =
  | { type: 'NAVIGATE'; target: PlanetId }
  | { type: 'ARRIVE' }
  | { type: 'RETURN' }
  | { type: 'COMPLETE_OUT' };

export interface FlightTransition {
  next: FlightState;
  duration: number; // ms
}

export function transition(
  state: FlightState,
  event: FlightEvent,
): FlightTransition {
  switch (state) {
    case 'IDLE':
      if (event.type === 'NAVIGATE') {
        return { next: 'FLYING_IN', duration: FLIGHT_DURATION_MS };
      }
      break;
    case 'FLYING_IN':
      if (event.type === 'NAVIGATE') {
        // retarget — same duration, no flicker
        return { next: 'FLYING_IN', duration: FLIGHT_DURATION_MS };
      }
      if (event.type === 'ARRIVE') {
        return { next: 'VIEWING', duration: 0 };
      }
      break;
    case 'VIEWING':
      if (event.type === 'NAVIGATE') {
        return { next: 'FLYING_IN', duration: FLIGHT_DURATION_MS };
      }
      if (event.type === 'RETURN') {
        return { next: 'FLYING_OUT', duration: FLIGHT_DURATION_MS };
      }
      break;
    case 'FLYING_OUT':
      if (event.type === 'NAVIGATE') {
        // user changed mind mid-flight-out → go to new target
        return { next: 'FLYING_IN', duration: FLIGHT_DURATION_MS };
      }
      if (event.type === 'COMPLETE_OUT') {
        return { next: 'IDLE', duration: 0 };
      }
      break;
  }
  // no-op
  return { next: state, duration: 0 };
}