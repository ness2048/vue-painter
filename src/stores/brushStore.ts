import { defineStore } from "pinia";
import brushData from "@/assets/brushes/brush.json";
import { PropType } from "pinia/node_modules/vue-demi";
import { BrushParameters, BrushParametersImplements } from "@/core/painting/brush-parameters";

export const useBrushStore = defineStore("storeId", {
  // 新規状態を返す関数
  state: () => ({
    brushes: [new BrushParametersImplements()],
    selectedBrush: new BrushParametersImplements(),
  }),
  // 任意のゲッター
  getters: {},
  // 任意アクション
  actions: {
    /**
     * ブラシ データを読み込みます。
     */
    fetch() {
      this.brushes = brushData.brushParameters;
    },
  },
});
