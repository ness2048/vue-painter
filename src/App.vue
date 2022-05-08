<template>
  <v-app dark>
    <v-app-bar height="22" color="grey-darken-3" class="elevation-1">
      <v-spacer></v-spacer>
      <v-btn id="color-activator">
        <v-icon :color="picker">mdi-circle</v-icon>
      </v-btn>
      <v-menu activator="#color-activator" anchor="start">
        <v-color-picker v-model="picker"></v-color-picker>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer color="grey-darken-3" permanent width="32"></v-navigation-drawer>
    <v-main>
      <v-container>
        <main-canvas :color="picker"></main-canvas>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
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
