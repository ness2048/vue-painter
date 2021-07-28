import { Vector2 } from 'three';

/**
 * ジェスチャーの内部状態を表します。
 */
export enum GestureNativeState {
  None,
  Moved,
  Pressed,
  SingleTap,
  SingleTapPressed,
}

/**
 * ジェスチャーのタイプを表します。
 */
export enum PaintGestureType {
  None,
  Pinch,
  PinchComplete,
  Hold,
  HoldMove,
  HoldComplete,
  DragComplete,
  FreeDrag,
  Tap,
  DoubleTap,
}

/**
 * ジェスチャーのサンプリングデータを表します。
 */
export interface PaintGestureSample {
  delta: Vector2;
  delta2: Vector2;
  gestureType: PaintGestureType;
  position: Vector2;
  position2: Vector2;
  positionId: number;
  positionId2: number;
  pressureFactor: number;
  pressureFactor2: number;
  timeStamp: number;
}
