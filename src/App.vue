<template>
  <v-app>
    <v-app-bar height="22" color="grey-darken-3" class="elevation-0">
      <v-spacer></v-spacer>
      <v-btn id="layer-activator">
        <v-icon color="grey-lighten-1">mdi-layers</v-icon>
      </v-btn>

      <v-btn id="color-activator">
        <v-icon :color="picker">mdi-circle</v-icon>
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
      <v-slider
        direction="vertical"
        label="Regular"
        color="grey-lighten-1"
        :width="10"
        :min="1"
        v-model="brushSize"
        class="brush-slider"
      ></v-slider>

      <!-- 不透明度 -->
      <!-- <v-slider
        direction="vertical"
        label="Regular"
        color="grey-lighten-1"
        :width="10"
        :min="1"
        v-model="transparent"
        class="brush-slider"
      ></v-slider> -->
    </v-navigation-drawer>

    <v-main class="bg-grey-darken-2">
      <v-container class="ml-0 pa-0">
        <main-canvas
          :brush-color="picker"
          :width="1000"
          :height="1000"
          :brush-size="brushSize"
        ></main-canvas>
      </v-container>
    </v-main>

    <!-- カラー パレット-->
    <v-menu activator="#color-activator" anchor="start">
      <v-color-picker v-model="picker"></v-color-picker>
    </v-menu>

    <!-- レイヤー -->
    <v-menu activator="#layer-activator" anchor="bottom">
      <v-card color="grey-darken-3"> <v-card-title>レイヤー</v-card-title> </v-card>
    </v-menu>

    <!-- ブラシ ライブラリ -->
    <v-menu activator="#brush-activator" anchor="end">
      <v-card color="grey-darken-3"> <v-card-title>ブラシのライブラリ</v-card-title> </v-card>
    </v-menu>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import MainCanvas from "./components/MainCanvas.vue";

export default defineComponent({
  components: {
    MainCanvas,
  },

  setup() {
    const picker = ref("black");
    const brushSize = ref(12);
    const transparent = ref(1);

    return {
      picker,
      brushSize,
      transparent,
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
.brush-slider.v-slider.v-input--vertical .v-input__control {
  min-height: 200px;
}
</style>
