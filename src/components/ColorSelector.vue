<template>
  <v-color-picker v-model="brushColorComputed" mode="rgb" dark></v-color-picker>
</template>

<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  props: {
    /**
     * ブラシ カラーを設定します。
     */
    brushColor: {
      type: String,
      default: () => "black", // ブラシ カラーのデフォルト値
    },
  },

  emits: ["update:brushColor"], // brushColor プロパティの更新

  setup(props, { emit }) {
    const { brushColor } = toRefs(props);
    const brushColorComputed = computed({
      get: () => brushColor.value,
      set: (value) => {
        emit("update:brushColor", value); // brushColor プロパティの更新
      },
    });

    return {
      brushColorComputed,
    };
  },
});
</script>

<style scoped>
.brush-slider.v-slider.v-input--vertical:deep() .v-input__control {
  min-height: 200px; /* スライダーの高さ */
}
</style>
