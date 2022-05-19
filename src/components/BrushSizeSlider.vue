<template>
  <v-slider
    v-model="brushSizeComputed"
    :min="1"
    :max="100"
    direction="vertical"
    color="grey-lighten-1"
    class="brush-slider"
  ></v-slider>
  <v-menu v-model="isThumb" :position-x="thumbX" :position-y="thumbY" absolute offset-y>
    <template v-slot:activator="{}"> </template>
    <v-card color="grey-darken-3"> <v-card-title>ブラシ サイズ</v-card-title> </v-card>
  </v-menu>
</template>

<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  props: {
    /**
     * ブラシ サイズを設定します。
     */
    brushSize: {
      type: Number,
      default: () => 12, // ブラシのデフォルトサイズ
    },
  },

  emits: ["update:brushSize"], // brushSize プロパティの更新

  setup(props, { emit }) {
    const { brushSize } = toRefs(props);
    const brushSizeComputed = computed({
      get: () => brushSize.value,
      set: (value) => {
        emit("update:brushSize", value); // brushSize プロパティの更新
      },
    });
    const isThumb = false;
    const thumbX = 0;
    const thumbY = 0;

    return {
      brushSizeComputed,
      isThumb,
      thumbX,
      thumbY,
    };
  },
});
</script>

<style scoped>
.brush-slider.v-slider.v-input--vertical >>> .v-input__control {
  min-height: 200px; /* スライダーの高さ */
}
</style>
