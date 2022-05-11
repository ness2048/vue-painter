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
import { defineComponent, onMounted, PropType, toRefs, watch } from "vue";
import { io, Socket } from "socket.io-client";

export default defineComponent({
  props: {
    /**
     * ブラシの色を設定します。
     */
    brushColor: {
      type: String as PropType<string>,
      default: () => "black",
    },
    /**
     * キャンバスの幅を設定します。
     */
    width: {
      type: Number,
      default: () => 1000,
    },
    /**
     * キャンバスの高さを設定します。
     */
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
    let receivedPaintCanvas!: PaintCanvas;
    let socket!: Socket;
    let strokes: NativePointerEvent[] = [];
    let prevTimeStamp = 0;

    onMounted(() => {
      const apiRoot = process.env.VUE_APP_API_URL;

      socket = io(apiRoot);
      socket.on("stroke", (points: NativePointerEvent[], brushColor: string) => {
        // ストローク イベントを受信した。
        receiveStroke(points, brushColor);
      });
      canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
      context = canvas.getContext("2d");

      if (context) {
        canvasImage = new CanvasImage(canvas.width, canvas.height);
        paintCanvas = new PaintCanvas(context, canvasImage);
        receivedPaintCanvas = new PaintCanvas(context, canvasImage);
      }

      const { brushColor } = toRefs(props);
      watch(brushColor, () => {
        // ブラシカラーが変更されたとき paintCanvas.brush.color を更新する。
        paintCanvas.brush.color = props.brushColor;
      });

      // キャンバスの描画を開始する。
      window.requestAnimationFrame(onDraw);
    });

    /**
     * ストローク情報をサーバーに送信します。
     * 送信後にストローク情報は消去されます。
     */
    const sendStroke = (): void => {
      socket.emit("stroke", strokes, paintCanvas.brush.color);
      strokes.length = 0;
    };

    /**
     * ストローク情報をサーバーから受信します。
     * @param strokes 受信したポインター イベントのリスト。
     * @param brushColor ブラシの色。
     */
    const receiveStroke = (points: NativePointerEvent[], brushColor: string): void => {
      points.forEach((pe) => {
        receivedPaintCanvas.update(pe);
      });
      receivedPaintCanvas.brush.color = brushColor;
    };

    /**
     * ポインターが押されたときの処理を行います。
     * @param pe ポインター イベント。
     */
    const onPointerDown = (pe: PointerEvent): void => {
      // const np = fromPointerEvent(pe);
      paintCanvas.update(pe);
      strokes.slice(0);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      pe.preventDefault();
    };

    /**
     * ポインターが移動したときの処理を行います。
     * @param pe ポインター イベント。
     */
    const onPointerMove = (pe: PointerEvent): void => {
      paintCanvas.update(pe);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      pe.preventDefault();
    };

    /**
     * ポインターが離されたときの処理を行います。
     * @param pe ポインター イベント。
     */
    const onPointerUp = (pe: PointerEvent): void => {
      paintCanvas.update(pe);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      sendStroke();
      pe.preventDefault();
    };

    /**
     * 描画が発生したときの処理を行います。
     * @param timestamp 描画が呼び出された時間。
     */
    const onDraw = (timestamp: number): void => {
      const elapsed = (timestamp - prevTimeStamp) / 1000;
      if (elapsed <= frameTime) {
        window.requestAnimationFrame(onDraw);
        return;
      }

      prevTimeStamp = timestamp;
      // ストロークを描画
      paintCanvas.draw();
      // 受信したストロークを描画
      receivedPaintCanvas.draw();
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
