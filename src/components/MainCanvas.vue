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
import {
  NativePointerEvent,
  NativePointerEventImplements,
  PaintCanvas,
} from "@/core/painting/paint-canvas";
import { Options, Vue } from "vue-class-component";
import { io, Socket } from "socket.io-client";
import { PaintGestureSample } from "@/core/painting/paint-gesture-sample";

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

  socket!: Socket;

  mounted() {
    const apiRoot = process.env.VUE_APP_API_URL;

    this.socket = io(apiRoot);
    this.socket.on("stroke", (strokes: NativePointerEvent[]) => {
      this.receiveStroke(strokes);
    });
    this.canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d");

    if (this.context) {
      this.canvasImage = new CanvasImage(this.canvas.width, this.canvas.height);
      this.paintCanvas = new PaintCanvas(this.context, this.canvasImage);
    }

    window.requestAnimationFrame(this.onDraw);
  }

  strokes: NativePointerEvent[] = [];

  sendStroke() {
    this.socket.emit("stroke", this.strokes);
    // this.strokes.slice(0);
    this.strokes.length = 0;
  }

  receiveStroke(strokes: NativePointerEvent[]) {
    strokes.forEach((pe) => {
      this.paintCanvas.update(pe);
    });
  }

  pointerDown(pe: PointerEvent) {
    // const np = fromPointerEvent(pe);
    this.paintCanvas.update(pe);
    this.strokes.slice(0);
    this.strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
    pe.preventDefault();
  }

  pointerMove(pe: PointerEvent) {
    this.paintCanvas.update(pe);
    this.strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
    pe.preventDefault();
  }

  pointerUp(pe: PointerEvent) {
    this.paintCanvas.update(pe);
    this.strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
    this.sendStroke();
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
* {
  touch-action: pan-x pan-y;
}
#main-canvas {
  border: 1px solid #000000;
  touch-action: none;
  user-select: none;
}

.eraser {
  cursor: url(../assets/images/eraser.png) 15 15, auto;
}
</style>
