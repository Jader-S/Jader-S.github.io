import { describe, it, expect } from 'vitest';
import { transition } from './flightMachine';

describe('flightMachine.transition', () => {
  it('IDLE + NAVIGATE -> FLYING_IN', () => {
    expect(transition('IDLE', { type: 'NAVIGATE', target: 'about' })).toEqual({
      next: 'FLYING_IN',
      duration: 1800,
    });
  });

  it('FLYING_IN + ARRIVE -> VIEWING', () => {
    expect(transition('FLYING_IN', { type: 'ARRIVE' })).toEqual({
      next: 'VIEWING',
      duration: 0,
    });
  });

  it('VIEWING + RETURN -> FLYING_OUT', () => {
    expect(transition('VIEWING', { type: 'RETURN' })).toEqual({
      next: 'FLYING_OUT',
      duration: 1800,
    });
  });

  it('FLYING_OUT + COMPLETE_OUT -> IDLE', () => {
    expect(transition('FLYING_OUT', { type: 'COMPLETE_OUT' })).toEqual({
      next: 'IDLE',
      duration: 0,
    });
  });

  it('FLYING_IN + NAVIGATE retargets (stays FLYING_IN)', () => {
    expect(transition('FLYING_IN', { type: 'NAVIGATE', target: 'blog' })).toEqual({
      next: 'FLYING_IN',
      duration: 1800,
    });
  });

  it('illegal transition is a no-op', () => {
    expect(transition('IDLE', { type: 'ARRIVE' })).toEqual({ next: 'IDLE', duration: 0 });
    expect(transition('IDLE', { type: 'RETURN' })).toEqual({ next: 'IDLE', duration: 0 });
    expect(transition('VIEWING', { type: 'COMPLETE_OUT' })).toEqual({
      next: 'VIEWING',
      duration: 0,
    });
  });
});
