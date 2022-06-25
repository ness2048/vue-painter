import { defineStore } from "pinia";
import brushData from "@/assets/brushes/brush.json";
import { BrushParametersImplements } from "@/core/painting/brush-parameters";
import { PaintUtility } from "@/core/painting/paint-utility";
import chroma from "chroma-js";

export const useBrushStore = defineStore("brushStore", {
  // 新規状態を返す関数
  state: () => ({
    brushes: [new BrushParametersImplements()],
    textures: {} as { [key: string]: ImageBitmap },
    selectedBrush: new BrushParametersImplements(),
    selectedColor: "",
    currentColorTexture: undefined as ImageBitmap | undefined,
  }),

  // ゲッター
  getters: {
    /**
     * 現在選択されているブラシのテクスチャを取得します。
     * @returns ブラシテクスチャ
     */
    currentTexture(): ImageBitmap | undefined {
      const url = this.selectedBrush.brushTextureUrl;
      return url ? this.textures[url as string] : undefined;
    },
  },

  // アクション
  actions: {
    /**
     * 指定した色でフィルターをかけた currentTexture を currentColorTexture に格納します。
     * 指定した色は selectedColor に設定されます。
     * @param color 色
     */
    async filterColorTexture(color: string) {
      if (!chroma.valid(color)) {
        // 不正な色
        return;
      }

      this.selectedColor = color;
      const colorTemp = chroma(color);

      // currentTexture を指定した色で塗りつぶす
      if (this.currentTexture) {
        const imgData = PaintUtility.createImageData(this.currentTexture);
        const filterData = PaintUtility.createColorFilterImageData(imgData, colorTemp);
        this.currentColorTexture = await createImageBitmap(filterData);
      } else {
        this.currentColorTexture = undefined;
      }
    },

    /**
     * ブラシ データとテクスチャを読み込みます。
     */
    async fetch() {
      // JSON データからブラシデータを読み込む
      this.brushes = brushData.brushParameters as Array<BrushParametersImplements>;

      // ブラシのテクスチャを読み込む
      const result = await Promise.all(
        this.brushes.map(async (b) => {
          if (!b.brushTextureUrl) {
            return;
          }
          const url = b.brushTextureUrl;
          if (b.brushTextureUrl) {
            const promise = new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = async () => {
                const bmp = await createImageBitmap(img);
                this.textures[url] = bmp;
                resolve();
              };
              img.src = url;
            });
            return promise;
          }
        })
      );
    },
  },
});
