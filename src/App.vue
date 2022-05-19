<template>
  <v-app>
    <v-app-bar height="22" color="grey-darken-3" class="elevation-0">
      <v-spacer></v-spacer>
      <v-btn id="layer-activator">
        <v-icon color="grey-lighten-1">mdi-layers</v-icon>
      </v-btn>

      <v-btn id="color-activator">
        <v-icon :color="brushColorRgb">mdi-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer color="grey-darken-3" permanent width="64">
      <v-list nav density="comfortable" bg-color="grey-darken-3">
        <v-list-item link id="brush-activator">
          <v-list-item-avatar>
            <v-icon color="grey-lighten-1">mdi-brush</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item active-color="primary">
          <v-list-item-avatar>
            <v-icon color="grey-lighten-1">mdi-format-color-fill</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item link>
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
          :brush-color="brushColor"
          :width="1000"
          :height="1000"
          :brush-size="brushSize"
        ></main-canvas>
      </v-container>
    </v-main>

    <!-- カラー パレット-->
    <v-menu activator="#color-activator" anchor="start" :close-on-content-click="false">
      <v-color-picker v-model="brushColor" dark></v-color-picker>
    </v-menu>

    <!-- レイヤー -->
    <v-menu activator="#layer-activator" anchor="bottom" :close-on-content-click="false">
      <v-card color="grey-darken-3"> <v-card-title>レイヤー</v-card-title> </v-card>
    </v-menu>

    <!-- ブラシ ライブラリ -->
    <v-menu activator="#brush-activator" anchor="end" :close-on-content-click="false">
      <v-card color="grey-darken-3"> <v-card-title>ブラシのライブラリ</v-card-title> </v-card>
    </v-menu>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import MainCanvas from "./components/MainCanvas.vue";
import BrushSizeSlider from "./components/BrushSizeSlider.vue";
import BrushAlphaSlider from "./components/BrushAlphaSlider.vue";
import chroma from "chroma-js";

export default defineComponent({
  components: {
    MainCanvas,
    BrushSizeSlider,
    BrushAlphaSlider,
  },

  setup() {
    const brushColor = ref("black"); // ブラシ選択色
    watch(brushColor, () => {
      const colorTmp = chroma(brushColor.value);
      brushColorRgb.value = parseColor(chroma(colorTmp.rgb()));
      // brushAlpha.value = chroma(brushColor.value).alpha();
    });

    const brushColorRgb = ref(brushColor.value); // アルファ値を除いたブラシ選択色
    const brushSize = ref(12); // ブラシ サイズ
    const brushAlpha = ref(1.0); // ブラシ アルファ
    watch(brushAlpha, () => {
      console.log("brushColor", brushColor.value);
      let colorTmp = chroma(brushColor.value);
      colorTmp = colorTmp.alpha(brushAlpha.value); // ブラシ選択色のアルファ値を変更
      const colorName = parseColor(colorTmp);
      console.log("colorName", colorName);
      brushColor.value = colorName; // 選択色を指定されたアルファ値に変更
    });

    const parseColor = (colorTmp: chroma.Color): string => {
      const colorName =
        "#" +
        colorTmp.get("rgba.r").toString(16).padStart(2, "0") +
        colorTmp.get("rgba.g").toString(16).padStart(2, "0") +
        colorTmp.get("rgba.b").toString(16).padStart(2, "0") +
        Math.round(255 * colorTmp.alpha())
          .toString(16)
          .padStart(2, "0");

      return colorName;
    };

    return {
      brushColor,
      brushColorRgb,
      brushSize,
      brushAlpha,
    };
  },
});
</script>

<style>
* {
  /* touch-action: pan-x pan-y; */
  /* touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none; */
}
* {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
</style>
