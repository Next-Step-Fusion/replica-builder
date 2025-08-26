import type { TokamakElement } from './TokamakElement';

export interface CoilMetadata {
  name: string;
  turns: number;
  resistance: number;
  inductance?: number;
  maxCurrent?: number;
  maxVoltage?: number;
  nFilamentsRadial?: number;
  nFilamentsVertical?: number;
}

export interface VesselMetadata {
  name: string;
  resistivity: number;
}

export interface PassiveElementMetadata {
  name: string;
  resistance: number;
  turns?: number;
  nFilamentsRadial?: number;
  nFilamentsVertical?: number;
}

export interface ProbeMetadata {
  name: string;
  effectiveLength: number;
  kpb?: number;
}

export interface LoopMetadata {
  name: string;
}

export type ElementMetadata<T extends TokamakElement> = T extends 'coil'
  ? CoilMetadata
  : T extends 'vessel'
    ? VesselMetadata
    : T extends 'passive'
      ? PassiveElementMetadata
      : T extends 'probe'
        ? ProbeMetadata
        : T extends 'loop'
          ? LoopMetadata
          : null;

export function getDefaultMetadata<T extends TokamakElement>(
  element: T
): ElementMetadata<T> | null {
  switch (element) {
    case 'coil':
      return {
        name: '',
        turns: 0,
        resistance: 0,
        inductance: 0,
        maxCurrent: 0,
        maxVoltage: 0,
        nFilamentsRadial: 0,
        nFilamentsVertical: 0
      } as ElementMetadata<T>;
    case 'vessel':
      return {
        name: '',
        resistivity: 0
      } as ElementMetadata<T>;
    case 'passive':
      return {
        name: '',
        resistance: 0,
        turns: 0,
        nFilamentsRadial: 0,
        nFilamentsVertical: 0
      } as ElementMetadata<T>;
    case 'probe':
      return {
        name: '',
        effectiveLength: 0,
        kpb: 0
      } as ElementMetadata<T>;
    case 'loop':
      return {
        name: ''
      } as ElementMetadata<T>;
    default:
      return null as ElementMetadata<T>;
  }
}
