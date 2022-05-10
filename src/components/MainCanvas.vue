<template>
  <div>
    <div id="canvas-area">
      <canvas
        id="main-canvas"
        :width="width"
        :height="height"
        @pointerdown.prevent="onPointerDown"
        @pointermove.prevent="onPointerMove"
        @pointerup.prevent="onPointerUp"
      >
      </canvas>
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
import { defineComponent, onMounted, PropType, ref, toRefs, watch } from "vue";
import { io, Socket } from "socket.io-client";

export default defineComponent({
  props: {
    color: {
      type: String as PropType<string>,
      default: () => "black",
    },
    width: {
      type: Number,
      default: () => 1000,
    },
    height: {
      type: Number,
      default: () => 1000,
    },
  },

  setup(props) {
    const FPS = 60;
    const frameTime = 1 / FPS;
    let canvas!: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null = null;
    let canvasImage!: CanvasImage;
    let paintCanvas!: PaintCanvas;
    let socket!: Socket;
    let strokes: NativePointerEvent[] = [];
    let prevTimeStamp = 0;

    onMounted(() => {
      const apiRoot = process.env.VUE_APP_API_URL;

      socket = io(apiRoot);
      socket.on("stroke", (strokes: NativePointerEvent[]) => {
        receiveStroke(strokes);
      });
      canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
      context = canvas.getContext("2d");

      if (context) {
        canvasImage = new CanvasImage(canvas.width, canvas.height);
        paintCanvas = new PaintCanvas(context, canvasImage);
      }

      const { color } = toRefs(props);
      watch(color, () => {
        paintCanvas.brush.color = props.color;
      });
      window.requestAnimationFrame(onDraw);
    });

    /**
     * ストローク情報をサーバーに送信します。
     * 送信後にストローク情報は消去されます。
     */
    const sendStroke = (): void => {
      socket.emit("stroke", strokes);
      // this.strokes.slice(0);
      strokes.length = 0;
    };

    /**
     * ストローク情報をサーバーから受診します。
     * @param strokes 受診したポインターイベントのリスト。
     */
    const receiveStroke = (strokes: NativePointerEvent[]): void => {
      strokes.forEach((pe) => {
        paintCanvas.update(pe);
      });
    };

    const onPointerDown = (pe: PointerEvent): void => {
      // const np = fromPointerEvent(pe);
      paintCanvas.update(pe);
      strokes.slice(0);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      pe.preventDefault();
    };

    const onPointerMove = (pe: PointerEvent): void => {
      paintCanvas.update(pe);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      pe.preventDefault();
    };

    const onPointerUp = (pe: PointerEvent): void => {
      paintCanvas.update(pe);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      sendStroke();
      pe.preventDefault();
    };

    const clear = (): void => {
      paintCanvas.clear();
    };

    const onDraw = (timestamp: number): void => {
      const elapsed = (timestamp - prevTimeStamp) / 1000;
      if (elapsed <= frameTime) {
        window.requestAnimationFrame(onDraw);
        return;
      }

      prevTimeStamp = timestamp;

      paintCanvas.draw();

      window.requestAnimationFrame(onDraw);
    };

    return {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  touch-action: pan-x pan-y;
}
#main-canvas {
  /* border: 1px solid #000000; */
  background-color: white;
  touch-action: none;
  user-select: none;
}
</style>
