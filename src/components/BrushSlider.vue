<template>
  <v-slider
    direction="vertical"
    label="Regular"
    color="grey-lighten-1"
    :width="10"
    :min="1"
    v-model="brushSizeComputed"
    class="brush-slider"
  ></v-slider>
</template>

<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, ref, toRefs, watch } from "vue";

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

    return {
      brushSizeComputed,
    };
  },
});
</script>

<style>
.brush-slider.v-slider.v-input--vertical .v-input__control {
  min-height: 200px; /* スライダーの高さ */
}
</style>
