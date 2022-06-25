<template>
  <v-slider
    v-model="brushAlphaComputed"
    :min="0.01"
    :max="1.0"
    direction="vertical"
    color="grey-lighten-1"
    class="brush-slider"
  ></v-slider>
</template>

<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  props: {
    /**
     * ブラシ アルファを設定します。
     */
    brushAlpha: {
      type: Number,
      default: () => 1.0, // ブラシのデフォルト アルファ値
    },
  },

  emits: ["update:brushAlpha"], // brushAlpha プロパティの更新

  setup(props, { emit }) {
    const { brushAlpha } = toRefs(props);
    const brushAlphaComputed = computed({
      get: () => brushAlpha.value,
      set: (value) => {
        emit("update:brushAlpha", value); // brushAlpha プロパティの更新
      },
    });

    return {
      brushAlphaComputed,
    };
  },
});
</script>

<style scoped>
.brush-slider.v-slider.v-input--vertical:deep() .v-input__control {
  min-height: 200px; /* スライダーの高さ */
}
</style>
