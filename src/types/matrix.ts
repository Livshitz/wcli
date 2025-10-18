/**
 * A frame is a 2D array where each value represents brightness (0 = off, 1 = full on)
 */
export type Frame = number[][];

export interface MatrixPattern {
  width: number;
  height: number;
  frame: Frame;
}

