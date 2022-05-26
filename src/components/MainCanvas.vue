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
import { PaintCanvas } from "@/core/painting/paint-canvas";
import {
  NativePointerEvent,
  NativePointerEventImplements,
} from "@/core/painting/NativePointerEvent";
import { defineComponent, onMounted, PropType, ref, toRefs, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { BrushParameters } from "@/core/painting/brush-parameters";

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
     * ブラシ サイズを設定します。
     */
    brushSize: {
      type: Number,
      default: () => 12,
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

      // sokcet.io 初期化
      socket = io(apiRoot);
      socket.on(
        "stroke",
        (data: { points: NativePointerEvent[]; brushParams: BrushParameters }) => {
          // ストローク イベントを受信した。
          receiveStroke(data);
        }
      );
      socket.on("downloadCanvas", (data: { image: ArrayBuffer }) => {
        // キャンバス ダウンロード イベントを受信した。
        receiveDownloadCanvas(data);
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

      const { brushSize } = toRefs(props);
      watch(brushSize, () => {
        // ブラシサイズが変更されたとき paintCanvas.brush.size を更新する。
        paintCanvas.brush.sizeParameters.size = props.brushSize;
      });

      // キャンバスをダウンロードする
      sendDownloadCanvas();

      // キャンバスの描画を開始する。
      window.requestAnimationFrame(onDraw);
    });

    /**
     * ストローク情報をサーバーに送信します。
     * 送信後にストローク情報は消去されます。
     */
    const sendStroke = (): void => {
      socket.emit("stroke", {
        points: strokes,
        brushParams: paintCanvas.brush.brushParameters,
      });
      strokes.length = 0;
    };

    /**
     * ストローク情報をサーバーから受信します。
     * @param points 受信したポインター イベントのリスト。
     * @param brushParams ブラシのパラメーター。
     */
    const receiveStroke = (data: {
      points: NativePointerEvent[];
      brushParams: BrushParameters;
    }): void => {
      receivedPaintCanvas.brush.brushParameters = data.brushParams;
      data.points.forEach((pe) => {
        receivedPaintCanvas.update(pe);
      });
    };

    const downloadUrl = ref("");

    // #region キャンバス イベント

    const sendUpdateCanvas = (): void => {
      canvas.toBlob((blob) => {
        console.log("sendUpdateCanvas", blob);
        if (!blob) {
          return;
        }
        socket.emit("updateCanvas", { image: blob });
      });
    };

    const sendDownloadCanvas = (): void => {
      socket.emit("downloadCanvas");
    };

    const receiveDownloadCanvas = async (data: { image: ArrayBuffer }): Promise<void> => {
      const blob = new Blob([data.image]);
      console.log("receiveDownloadCanvas", blob);
      const bitmap = await createImageBitmap(blob);
      context?.drawImage(bitmap, 0, 0);
    };

    const sendCanvasTimer = setInterval(() => {
      console.log("sendCanvasTimer");
      sendUpdateCanvas();
    }, 1000 * 10);

    // #endregion キャンバス イベント

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
      downloadUrl,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  /* touch-action: pan-x pan-y; */
}
#main-canvas {
  background-color: white;
}
</style>
