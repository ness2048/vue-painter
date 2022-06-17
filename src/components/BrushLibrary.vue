<template>
  <v-card color="grey-darken-3" max->
    <v-card-title>ブラシのライブラリ</v-card-title>
    <v-container class="ma-0 pa-0">
      <v-list
        density="comfortable"
        bg-color="grey-darken-3"
        class="overflow-y-auto"
        :selected="selectedItem"
      >
        <v-list-item
          v-for="(brush, i) in brushes"
          :key="i"
          :value="brush"
          active-color="primary"
          variant="plain"
          @click="selectItem(brush)"
        >
          <v-list-item-avatar start>
            <v-icon icon="mdi-brush"></v-icon>
          </v-list-item-avatar>
          <v-list-item-subtitle v-text="brush.fullName" class="sub"></v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, toRefs, PropType, watch } from "vue";
import { BrushParameters, BrushParametersImplements } from "@/core/painting/brush-parameters";
import { useBrushStore } from "@/stores/brushStore";
import { storeToRefs } from "pinia";

export default defineComponent({
  props: {
    /**
     * ブラシを設定します。
     */
    brush: {
      type: Object as PropType<BrushParametersImplements>,
    },
  },

  emits: ["update:brush"], // brush プロパティの更新

  setup(props, { emit }) {
    // コンポーネント プロパティの抽出
    const { brush } = toRefs(props);
    const brushComputed = computed({
      get: () => brush.value,
      set: (value) => {
        emit("update:brush", value); // brush プロパティの更新
      },
    });

    const selectedItem = ref([]);
    watch(
      selectedItem,
      () => {
        console.log(selectedItem);
      },
      { deep: true }
    );

    const selectItem = (item: BrushParameters) => {
      console.log(item);
      brushStore.selectedBrush = item;
    };

    // ストアの作成
    const brushStore = useBrushStore();

    // ストア プロパティの抽出
    const { brushes } = storeToRefs(brushStore);

    // ストア データの読み込み
    // brushStore.fetch();

    console.log(brushes);

    return {
      brushComputed,
      brushes,
      selectedItem,
      selectItem,
    };
  },
});
</script>

<style scoped></style>
