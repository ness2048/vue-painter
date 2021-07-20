<template>
  <div>
    <div id="canvas-area">
      <canvas
        id="main-canvas"
        v-bind:class="{eraser: canvasMode === 'eraser'}"
        width="640"
        height="800"
        @pointerdown.prevent="pointerDown"
        @pointermove.prevent="pointerMove"
        @pointerup.prevent="pointerUp">
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
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    msg: String,
  },
})
export default class MainCanvas extends Vue {
  canvasMode = 'pen';

  canvas!: HTMLCanvasElement;

  context: CanvasRenderingContext2D | null = null;

  isDrag = false;

  mounted() {
    this.canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.pen();
  }

  pointerDown(e: PointerEvent) {
    // console.log('pointerDown', e);
    this.dragStart(e);
  }

  pointerMove(e: PointerEvent) {
    // console.log('pointerMove', e);
    this.draw(e);
  }

  pointerUp(e: PointerEvent) {
    // console.log('pointerUp', e);
    this.dragEnd();
  }

  // 描画
  draw(e: PointerEvent) {
    const x = Math.floor(e.offsetX);
    const y = Math.floor(e.offsetY);

    if (!this.isDrag) {
      return;
    }

    if (this.context) {
      // ブラシの設定
      this.context.fillStyle = 'rgba(0, 0, 0, 0)';
      this.context.strokeStyle = `rgba(0,0,0,${e.pressure})`;
      this.context.lineWidth = e.pressure * 50;

      // ストロークの描画
      this.context.lineTo(x, y);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(x, y);
    }
  }

  // 描画開始（mousedown）
  dragStart(e: PointerEvent) {
    const x = e.offsetX;
    const y = e.offsetY;

    if (this.context) {
      this.context.beginPath();
      this.context.moveTo(x, y);
    }

    this.isDrag = true;
  }

  // 描画終了（mouseup, mouseout）
  dragEnd() {
    if (this.context) {
      this.context.closePath();
    }
    this.isDrag = false;
  }

  /**
   * キャンバスを消去します。
   */
  clear() {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // ペンモード
  pen() {
    // カーソル変更
    this.canvasMode = 'pen';

    // 描画設定
    if (this.context) {
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
    }
  }

  /**
   * 消しゴムモード
   */
  erase() {
    // カーソル変更
    this.canvasMode = 'eraser';

    // 描画設定
    if (this.context) {
      this.context.lineCap = 'square';
      this.context.lineJoin = 'round';
      this.context.lineWidth = 30;
      this.context.strokeStyle = '#FFFFFF';
    }
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
