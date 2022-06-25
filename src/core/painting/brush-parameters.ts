import { BrushSizeParameters, BrushSizeParametersImplements } from "./brush-size-parameters";

/**
 * ブラシのパラメーターを表します。
 */
export interface BrushParameters {
  /**
   * アルファ値。
   */
  alpha: number;

  /**
   * ブラシのテクスチャ。
   */
  brushTextureUrl?: string;

  /**
   * ブラシの色を表す RGB 値とα値。
   */
  color: string;

  /**
   * 点を描画する間隔の比率を取得または設定します。
   * 0.5 を指定すると 50% ずつの間隔で、1 を指定すると 100% ずつの間隔で点が描画されます。
   */
  distanceRatio: number;

  /**
   * ブラシの名前を取得または設定します。
   */
  name: string;

  /**
   * ブラシの正式名称を取得または設定します。
   */
  fullName: string;

  /**
   * ブラシの合成方法を取得または設定します。
   */
  compositeOperation: GlobalCompositeOperation;

  /**
   * ブラシサイズに関するパラメーターを取得または設定します。
   */
  sizeParameters: BrushSizeParameters;
}

export class BrushParametersImplements implements BrushParameters {
  alpha = 1;
  brushTextureUrl?: string;
  color = "black";
  distanceRatio = 0.1;
  name = "";
  fullName = "";
  compositeOperation: GlobalCompositeOperation = "source-over";
  sizeParameters: BrushSizeParameters = new BrushSizeParametersImplements();
}
