<template>
  <div>
    <div id="canvas-area">
      <canvas
        id="main-canvas"
        v-bind:class="{ eraser: canvasMode === 'eraser' }"
        width="640"
        height="800"
        @pointerdown.prevent="pointerDown"
        @pointermove.prevent="pointerMove"
        @pointerup.prevent="pointerUp"
      >
      </canvas>
    </div>
    <div id="tool-area">
      <button id="pen-button" @click="pen">ペン</button>
      <button id="eraser-button" @click="erase">消しゴム</button>
      <button id="clear-button" @click="clear">消去</button>
    </div>
  </div>
</template>

<script lang="ts">
import { CanvasImage } from "@/core/painting/canvas-image";
import { PaintCanvas } from "@/core/painting/paint-canvas";
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    msg: String,
  },
})
export default class MainCanvas extends Vue {
  canvasMode = "pen";

  canvas!: HTMLCanvasElement;

  context: CanvasRenderingContext2D | null = null;

  canvasImage!: CanvasImage;

  paintCanvas!: PaintCanvas;

  mounted() {
    this.canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d");

    if (this.context) {
      this.canvasImage = new CanvasImage(this.canvas.width, this.canvas.height);
      this.paintCanvas = new PaintCanvas(this.context, this.canvasImage);
    }

    window.requestAnimationFrame(this.onDraw);
  }

  pointerDown(pe: PointerEvent) {
    this.paintCanvas.update(pe);
    pe.preventDefault();
  }

  pointerMove(pe: PointerEvent) {
    this.paintCanvas.update(pe);
    pe.preventDefault();
  }

  pointerUp(pe: PointerEvent) {
    this.paintCanvas.update(pe);
    pe.preventDefault();
  }

  clear() {
    this.paintCanvas.clear();
  }

  readonly FPS = 60;

  frameTime = 1 / this.FPS;

  prevTimeStamp = 0;

  onDraw(timestamp: number) {
    const elapsed = (timestamp - this.prevTimeStamp) / 1000;
    if (elapsed <= this.frameTime) {
      window.requestAnimationFrame(this.onDraw);
      return;
    }

    this.prevTimeStamp = timestamp;

    this.paintCanvas.draw();

    window.requestAnimationFrame(this.onDraw);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#main-canvas {
  border: 1px solid #000000;
  touch-action: none;
}

.eraser {
  cursor: url(../assets/images/eraser.png) 15 15, auto;
}
</style>
