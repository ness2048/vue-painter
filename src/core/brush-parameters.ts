import { BrushSizeParameters } from "./brush-size-parameters";

export enum BlendState {
  zero,
  one,
  destinationColor,
  inverseDestinationColor,
  destinationAlpha,
  inverseDestinationAlpha,
  souceColor,
  inverseSourceColor,
  souceAlpha,
  inverseSourceAlpha,
  sourceAlphaSaturation,
  blendFactor,
  inverseBlendFactor,
}

/**
 * ブラシの表現手法を表します。
 */
enum ExpressionStyleType {
  /**
   * ブラシの表現に何も影響を与えません。
   */
  none,

  /**
   * 速度に基づいたブラシ表現を表します。
   * スタイラスの速度が速いほどブラシの特性値は小さくなり、遅いほど大きくなります。
   */
  speed,

  /**
   * 方向に基づいたブラシ表現を表します。
   */
  direction,

  /**
   * 特性値に乱数を使用します。
   */
  random,
}

/**
 * ブラシのパラメーターを表します。
 */
export class BrushParameters {
  private blendStateValue = BlendState.zero;

  // ブラシのテクスチャ イメージ
  private brushTextureValue?: CanvasImageSource;

  // ブラシの色を表す RGB 値とα値
  private colorValue = "black";

  // 点を描画する間隔の比率
  private distanceRatioValue = 0.1;

  private nameValue = "";

  // ブラシサイズ
  private sizeParametersValue: BrushSizeParameters = new BrushSizeParameters();

  /**
   * ブレンディング ステートを取得または設定します。
   */
  public get blendState2(): BlendState {
    return this.blendStateValue;
  }

  public set blendState2(value: BlendState) {
    this.blendStateValue = value;
  }

  /**
   * ブラシのテクスチャを取得または設定します。
   */

  public get brushTexture(): CanvasImageSource | undefined {
    return this.brushTextureValue;
  }

  public set brushTexture(value: CanvasImageSource | undefined) {
    this.brushTextureValue = value;
  }

  /**
   * ブラシの色を表す RGB 値とα値を取得または設定します。
   */
  public get color(): string {
    return this.colorValue;
  }

  public set color(value: string) {
    this.colorValue = value;
  }

  /**
   * 点を描画する間隔の比率を取得または設定します。
   * 0.5 を指定すると 50% ずつの間隔で、1 を指定すると 100% ずつの間隔で点が描画されます。
   */
  public get distanceRatio(): number {
    return this.distanceRatioValue;
  }

  public set distanceRatio(value: number) {
    this.distanceRatioValue = value;
  }

  /**
   * 点を描画する間隔のピクセルサイズを取得します。
   * @returns size * distanceRatio
   */
  public get distance(): number {
    return this.sizeParametersValue.size * this.distanceRatio;
  }

  /**
   * ブラシの名前を取得または設定します。
   */
  public get name(): string {
    return this.nameValue;
  }

  public set name(value: string) {
    this.nameValue = value;
  }

  /**
   * ブラシの正式名称を取得または設定します。
   */
  public get fullName(): string {
    // TODO 正式名所の取得を実装する
    return "";
  }

  /**
   * ブラシサイズに関するパラメーターを取得または設定します。
   */
  public get sizeParameters(): BrushSizeParameters {
    return this.sizeParametersValue;
  }

  public set sizeParameters(value: BrushSizeParameters) {
    this.sizeParametersValue = value;
  }
}
