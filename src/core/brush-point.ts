import * as THREE from "three";
import { Vector2 } from "three";

export class BrushPoint {
  public x = 0;

  public y = 0;

  public timeStamp: number = new Date().getTime();

  public pressureFactor = 0;

  public angle = 0;

  public speed = 0;

  public static distance(p1: BrushPoint, p2: BrushPoint): number {
    return p1.toVector2().distanceTo(p2.toVector2());
  }

  public toVector2(): THREE.Vector2 {
    return new Vector2(this.x, this.y);
  }
}
