import { defineStore } from "pinia";
import brushData from "@/assets/brushes/brush.json";
import { BrushParametersImplements } from "@/core/painting/brush-parameters";
import { PaintUtility } from "@/core/painting/paint-utility";
import chroma from "chroma-js";

export const useBrushStore = defineStore("storeId", {
  // 新規状態を返す関数
  state: () => ({
    brushes: [new BrushParametersImplements()],
    textures: {} as { [key: string]: ImageBitmap },
    selectedBrush: new BrushParametersImplements(),
    selectedColor: "",
    currentTexture: undefined as ImageBitmap | undefined,
    currentColorTexture: undefined as ImageBitmap | undefined,
  }),
  // 任意のゲッター
  getters: {},
  // 任意アクション
  actions: {
    async setSelectedColor(color: string) {
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
      }
    },

    /**
     * ブラシ データを読み込みます。
     */
    async fetch() {
      // JSON データからブラシデータを読み込む
      this.brushes = brushData.brushParameters as Array<BrushParametersImplements>;

      // ブラシのテクスチャを読み込む
      const result = await Promise.all(
        this.brushes.map(async (b) => {
          const promise = new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = async () => {
              const bmp = await createImageBitmap(img);
              this.textures[b.brushTextureUrl] = bmp;
              resolve();
            };
            img.src = b.brushTextureUrl;
          });
          return promise;
        })
      );
    },
  },
});
