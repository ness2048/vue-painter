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
import { useBrushStore } from "@/stores/brushStore";
import { storeToRefs } from "pinia";
import { PaintUtility } from "@/core/painting/paint-utility";

export default defineComponent({
  props: {
    /**
     * ブラシのアルファ値。
     */
    brushAlpha: {
      type: Number as PropType<number>,
      default: () => 1,
    },
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

  emits: [
    "update:brushAlpha", // brushAlpha プロパティの更新
    "update:brushSize", // brushSize プロパティの更新
  ],

  setup(props, { emit }) {
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

    const { brushAlpha, brushColor, brushSize } = toRefs(props);
    watch(brushAlpha, async () => {
      // ブラシアルファが変更されたとき paintCanvas.brush.alpha を更新する。
      paintCanvas.brush.alpha = props.brushAlpha;
    });

    watch(brushColor, async () => {
      // ブラシカラーが変更されたとき paintCanvas.brush.color を更新する。
      paintCanvas.brush.color = props.brushColor;
      await brushStore.filterColorTexture(props.brushColor);
    });

    watch(brushSize, () => {
      // ブラシサイズが変更されたとき paintCanvas.brush.size を更新する。
      paintCanvas.brush.sizeParameters.size = props.brushSize;
    });

    // ストアの作成
    const brushStore = useBrushStore();

    // ストア プロパティの抽出
    const { selectedBrush, currentColorTexture } = storeToRefs(brushStore);
    watch(selectedBrush, async () => {
      // ブラシが変更されたとき brushParameters とテクスチャを更新する。
      await brushStore.filterColorTexture(props.brushColor);
      paintCanvas.brush.brushParameters = selectedBrush.value;
      // paintCanvas.brush.alpha = selectedBrush.value.alpha;
      paintCanvas.brush.color = props.brushColor;
      // paintCanvas.brush.brushTexture = currentColorTexture.value;
      emit("update:brushAlpha", selectedBrush.value.alpha);
      emit("update:brushSize", selectedBrush.value.sizeParameters.size);
    });

    watch(currentColorTexture, async () => {
      // カレントカラーテクスチャが変更された
      if (currentColorTexture) {
        paintCanvas.brush.brushTexture = currentColorTexture.value;
      }
    });

    onMounted(async () => {
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

      // ブラシを読み込む
      await brushStore.fetch();

      // 標準ブラシを選択
      selectedBrush.value = brushStore.brushes.find((b) => b.name === "Normal") as BrushParameters;

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
    const receiveStroke = async (data: {
      points: NativePointerEvent[];
      brushParams: BrushParameters;
    }): Promise<void> => {
      receivedPaintCanvas.brush.brushParameters = data.brushParams;

      // 指定した色でフィルターしたテクスチャをPaintCahvasに登録する
      if (data.brushParams.brushTextureUrl) {
        const brushTexture = brushStore.textures[data.brushParams.brushTextureUrl];
        const imgData = PaintUtility.createImageData(brushTexture);
        const color = PaintUtility.stringToColor(data.brushParams.color);
        const filterData = PaintUtility.createColorFilterImageData(imgData, color);
        receivedPaintCanvas.brush.brushTexture = await createImageBitmap(filterData);
      } else {
        receivedPaintCanvas.brush.brushTexture = undefined;
      }

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

    let strokeMode: "none" | "paint" | "erase" = "none";

    /**
     * ポインターが押されたときの処理を行います。
     * @param pe ポインター イベント。
     */
    const onPointerDown = (pe: PointerEvent): void => {
      paintCanvas.update(pe);
      strokes.slice(0);
      strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      strokeMode = "paint";
      pe.preventDefault();
    };

    /**
     * ポインターが移動したときの処理を行います。
     * @param pe ポインター イベント。
     */
    const onPointerMove = (pe: PointerEvent): void => {
      if (strokeMode === "paint") {
        paintCanvas.update(pe);
        strokes.push(NativePointerEventImplements.fromPointerEvent(pe));
      }
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
      strokeMode = "none";
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
#main-canvas {
  background-color: white;
}
</style>
