<template>
  <v-app>
    <v-app-bar height="22" color="grey-darken-3" class="elevation-0">
      <v-spacer></v-spacer>
      <!-- レイヤー -->
      <v-btn id="layer-activator">
        <v-icon color="grey-lighten-1">mdi-layers</v-icon>
      </v-btn>

      <!-- カラー -->
      <v-btn id="color-activator">
        <v-icon :color="brushColor">mdi-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer color="grey-darken-3" permanent rail rail-width="64" stateless>
      <v-list nav density="comfortable" bg-color="grey-darken-3">
        <!-- ブラシ -->
        <v-list-item link id="brush-activator" @click="brushClick">
          <v-list-item-avatar>
            <v-icon color="grey-lighten-1">mdi-brush</v-icon>
          </v-list-item-avatar>
        </v-list-item>
        <!-- 
        <v-list-item active-color="primary">
          <v-list-item-avatar>
            <v-icon color="grey-lighten-1">mdi-format-color-fill</v-icon>
          </v-list-item-avatar>
        </v-list-item> -->

        <!-- 消しゴム -->
        <v-list-item link @click="eraserClick">
          <v-list-item-avatar>
            <v-icon color="grey-lighten-1">mdi-eraser</v-icon>
          </v-list-item-avatar>
        </v-list-item>
      </v-list>

      <!-- ブラシ サイズ -->
      <brush-size-slider v-model:brush-size="brushSize"></brush-size-slider>

      <!-- ブラシ アルファ -->
      <brush-alpha-slider v-model:brush-alpha="brushAlpha"></brush-alpha-slider>
    </v-navigation-drawer>

    <v-main class="bg-grey-darken-2">
      <v-container class="ml-0 pa-0">
        <main-canvas
          v-model:brush-alpha="brushAlpha"
          :brush-color="brushColor"
          v-model:brush-size="brushSize"
          :width="1000"
          :height="1000"
        ></main-canvas>
      </v-container>
    </v-main>

    <!-- カラー パレット-->
    <v-menu activator="#color-activator" anchor="start" :close-on-content-click="true">
      <color-selector v-model:brush-color="brushColor"></color-selector>
    </v-menu>

    <!-- レイヤー -->
    <v-menu activator="#layer-activator" anchor="bottom" :close-on-content-click="true">
      <v-card color="grey-darken-3"> <v-card-title>レイヤー</v-card-title> </v-card>
    </v-menu>

    <!-- ブラシ ライブラリ -->
    <v-menu activator="#brush-activator" anchor="end" :close-on-content-click="true">
      <brush-library :excludes="['Eraser']"></brush-library>
    </v-menu>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import MainCanvas from "./components/MainCanvas.vue";
import BrushSizeSlider from "./components/BrushSizeSlider.vue";
import BrushAlphaSlider from "./components/BrushAlphaSlider.vue";
import BrushLibrary from "./components/BrushLibrary.vue";
import ColorSelector from "./components/ColorSelector.vue";
import chroma from "chroma-js";
import { PaintUtility } from "./core/painting/paint-utility";
import { storeToRefs } from "pinia";
import { useBrushStore } from "./stores/brushStore";
import { BrushParametersImplements } from "./core/painting/brush-parameters";

export default defineComponent({
  components: {
    MainCanvas,
    BrushSizeSlider,
    BrushAlphaSlider,
    BrushLibrary,
    ColorSelector,
  },

  setup() {
    const brushStore = useBrushStore();
    const { selectedBrush } = storeToRefs(brushStore);
    const brushColor = ref("black"); // ブラシ選択色
    const brushAlpha = ref(1.0); // ブラシ アルファ
    const brushSize = ref(12); // ブラシ サイズ
    watch(brushAlpha, () => {
      // ブラシ アルファが変更された
      // let colorTmp = chroma(brushColor.value);
      // colorTmp = colorTmp.alpha(brushAlpha.value); // ブラシ選択色のアルファ値を変更
      // const colorName = PaintUtility.parseColor(colorTmp);
      // brushColor.value = colorName; // 選択色を指定されたアルファ値に変更
      // selectedBrush.value.alpha = brushAlpha.value;
    });
    const mode = ref("pen" as "pen" | "erase");

    watch(selectedBrush, () => {
      // brushSize.value = selectedBrush.value.sizeParameters.size;
      // brushAlpha.value = selectedBrush.value.alpha;
    });

    window.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    const brushClick = () => {
      // ブラシを選択
      mode.value = "pen";
    };

    const eraserClick = () => {
      // 消しゴムを選択
      mode.value = "erase";
      selectedBrush.value = brushStore.brushes.find(
        (b) => b.name === "Eraser"
      ) as BrushParametersImplements;
    };

    return {
      brushAlpha,
      brushColor,
      brushSize,
      mode,
      brushClick,
      eraserClick,
    };
  },
});
</script>

<style>
* {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
</style>
