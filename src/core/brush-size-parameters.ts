import { ExpressionStyleBase } from './expression-style-base';
import { NoneExpressionStyle } from './painting/none-expression-style';

/**
 * ブラシサイズのパラメーターを表します。
 */
export class BrushSizeParameters {
  private sizeValue = 10;

  private minimumSizeRatioValue = 1.0;

  private expressionStyleValue: ExpressionStyleBase = NoneExpressionStyle.Instance;

  /**
   * ブラシのデフォルトのピクセルサイズを取得します。
   * @default 10
   */
  public get size(): number {
    return this.sizeValue;
  }

  /**
   * ブラシのデフォルトのピクセルサイズを設定します。
   */
  public set size(value: number) {
    this.sizeValue = value;
  }

  /**
   * ブラシの最小サイズの比率を取得または設定します。
   * @default 1.0
   */
  public get minimumSizeRatio(): number {
    return this.minimumSizeRatioValue;
  }

  public set minimumSizeRatio(value: number) {
    this.minimumSizeRatioValue = value;
  }

  /**
   * ブラシの最小サイズを取得または設定します。
   * @returns size * minimumSizeRatio を返します。
   */
  public get minimumSize(): number {
    return this.sizeValue * this.minimumSizeRatioValue;
  }

  /**
   * ブラシサイズの表現手法を取得または設定します。
   * @default NoneExpressionStyle
   */
  public get expressionStyle(): ExpressionStyleBase {
    return this.expressionStyleValue;
  }

  public set expressionStyle(value: ExpressionStyleBase) {
    this.expressionStyleValue = value;
  }
}
