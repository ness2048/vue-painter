import { Vector2 } from 'three';
import { BrushParameters } from './brush-parameters';
import { BrushPoint } from './brush-point';

export class PaintUtility {
  /* eslint no-param-reassign: ["error", { "props": false }] */
  /**
   * 点を描画します。
   * @param context 2D キャンバスのレンダリング コンテキスト。
   * @param brush ブラシ。
   * @param p 描画する位置。
   */
  public static drawPoint(context: CanvasRenderingContext2D, brush: BrushParameters,
    p: BrushPoint) {
    // if (!brush.brushTexture) {
    //   return;
    // }
    const sizeParams = brush.sizeParameters;
    // const brushSize = sizeParams.minimumSize
    //   + sizeParams.expressionStyle.apply(p, (sizeParams.size - sizeParams.minimumSize))
    //  * p.pressureFactor;
    const brushSize = sizeParams.minimumSize + (sizeParams.size - sizeParams.minimumSize)
      * p.pressureFactor;

    // const t = new Vector2(p.x - brushSize / 2, p.y - brushSize / 2);
    // const sx = 0;
    // const sy = 0;
    // const sWidth = brush.brushTexture.width as number;
    // const sHeight = brush.brushTexture.height as number;
    // const dx = t.x;
    // const dy = t.y;
    // const dWidth = brushSize;
    // const dHeight = brushSize;
    // context.drawImage(brush.brushTexture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    context.beginPath();
    context.arc(p.x, p.y, brushSize, 0, (360 * Math.PI) / 180);
    // context.fillStyle = `rgb(0, 0, 0, 0.5)`; // brush.color;
    context.fillStyle = brush.color;
    context.globalAlpha = p.pressureFactor;
    context.fill();
    // context.strokeStyle = 'purple';
    // context.lineWidth = 0;
    // context.stroke();

    // TODO brush.color を実装すること。
    // const spriteBatch.Draw(brush.BrushTexture, destRect, srcRect, brush.Color);
  }

  /**
   * 2点間に線を描画します。
   * brush.distance で指定された間隔ごとに点を描画して線を表現します。
   * そのため、最後に描画される点の位置が p2 で指定された位置とずれることがあります。
   * @param context 2D キャンバスのレンダリング コンテキスト。
   * @param brush ブラシ。
   * @param p1 開始点。
   * @param p2 終了点。
   * @param isRenderStartPoint 開始位置の点を描画するかどうか。
   * @returns 最後に描画された点。何も描画されなかった場合は undefined を返します。
   */
  public static drawLine(context: CanvasRenderingContext2D, brush: BrushParameters,
    p1: BrushPoint, p2: BrushPoint, isRenderStartPoint: boolean): BrushPoint | undefined {
    const dx = p2.x - p1.x; // ⊿x
    const dy = p2.y - p1.y; // ⊿y
    const signX = dx < 0 ? -1 : 1;
    const signY = dy < 0 ? -1 : 1;
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const d = brush.distance; // 間隔
    const deltaDistance = BrushPoint.distance(p1, p2) / d;
    const ds = (p2.speed - p1.speed) / deltaDistance; // ⊿speed
    const dp = (p2.pressureFactor - p1.pressureFactor) / deltaDistance; // ⊿pressureFactor

    if (dx === 0) {
      // 線が垂直の場合。
      return PaintUtility.drawLinePoints(context, brush, p1, 0, brush.distance * signY, ds, dp,
        (sp) => minY <= sp.y && sp.y <= maxY, isRenderStartPoint);
    }

    if (dy === 0) {
      // 線が水平の場合。
      return PaintUtility.drawLinePoints(context, brush, p1, brush.distance * signX, 0, ds, dp,
        (sp) => minX <= sp.x && sp.x <= maxX, isRenderStartPoint);
    }

    const a = dy / dx; // 傾き
    const x = Math.sqrt((d * d) / (a * a + 1)) * signX; // d までの x 座標
    const y = a * x; // d までの y 座標

    if (Math.abs(dx) > Math.abs(dy)) {
      return PaintUtility.drawLinePoints(context, brush, p1, x, y, ds, dp,
        (sp) => minX <= sp.x && sp.x <= maxX, isRenderStartPoint); // y 軸の判定は省略。
    }

    return PaintUtility.drawLinePoints(context, brush, p1, x, y, ds, dp,
      (sp) => minY <= sp.y && sp.y <= maxY, isRenderStartPoint); // x 軸の判定は省略。
  }

  /**
   * pred の条件に一致するまで、p の位置から dx, dy で指定された距離だけ移動して点を描画します。
   * ブレゼンハムの直線アルゴリズムを使用して点を描画します。
   * p の位置から dx, dy で指定された距離だけ移動して点を描画したの
   * ち pred を判定します。条件に一致しなければ、さらに dx, dy の距
   * 離だけ移動して点を描画し、再度 pred の判定を行います。条件に一
   * 致した場合は処理を終了します。
   * @param context 2D キャンバスのレンダリング コンテキスト。
   * @param brush ブラシ。
   * @param p 描画開始位置。
   * @param dx x の移動量。
   * @param dy y の移動量。
   * @param ds 速度の移動量。
   * @param dp 筆圧の移動量。
   * @param pred 条件。
   * @param isRenderStartPoint 開始位置の点を描画するかどうか。
   * @returns 最後に描画された点。何も描画されなかった場合は undefined 。
   */
  public static drawLinePoints(context: CanvasRenderingContext2D, brush: BrushParameters,
    startPoint: BrushPoint, dx: number, dy: number, ds: number, dp: number,
    pred:{ (point: BrushPoint): boolean }, isRenderStartPoint: boolean): BrushPoint | undefined {
    let lastPoint: BrushPoint | undefined;
    let isStartPoint = true;
    const pointTemp = startPoint;
    while (true) {
      if (isStartPoint) {
        isStartPoint = false;
        if (isRenderStartPoint) {
          PaintUtility.drawPoint(context, brush, pointTemp);
          lastPoint = pointTemp;
        }
      } else {
        PaintUtility.drawPoint(context, brush, pointTemp);
        lastPoint = pointTemp;
      }

      pointTemp.x += dx;
      pointTemp.y += dy;
      pointTemp.speed += ds;
      pointTemp.pressureFactor += dp;

      if (pred(pointTemp) === false) {
        break;
      }
    }

    return lastPoint;
  }
}
