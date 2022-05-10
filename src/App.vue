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
      <v-menu activator="#color-activator" anchor="start">
        <v-color-picker v-model="picker"></v-color-picker>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer color="grey-darken-3" permanent width="64">
      <v-list nav density="comfortable" bg-color="grey-darken-3">
        <v-list-item>
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
    </v-navigation-drawer>

    <v-main class="bg-grey-darken-2">
      <v-container class="ml-0 pa-0">
        <main-canvas :brush-color="picker" :width="1000" :height="1000"></main-canvas>
      </v-container>
    </v-main>
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

    return {
      picker,
    };
  },
});
</script>
