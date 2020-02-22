// img要素を非同期で読み込んで
// 読み込み終わったらimg要素として解決するPromiseを返す
async function loadImageAsync(srcUrl) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = srcUrl;
    img.onload = (event) => {
      resolve(img);
    };
  });
}

class DataStore {
  constructor(keyPrefix = '') {
    this._storage = localStorage;
    this._storeKey = keyPrefix ? `${keyPrefix}/preferences` : 'preferences';
  }

  saveJson(json) {
    if(this._storage) {
      this._storage.setItem(this._storeKey, JSON.stringify(json));
    }
  }

  loadAsJson() {
    if(this._storage && this._storage.getItem(this._storeKey)) {
      try {
        return JSON.parse(this._storage.getItem(this._storeKey));
      } catch(e) {
        return {};
      }
    } else {
      return {};
    }
  }

  get buttonTiming() {
    const pref = this.loadAsJson();
    return 'buttonTiming' in pref ? pref.buttonTiming : 'immediate';
  }

  set buttonTiming(value) {
    const pref = this.loadAsJson();
    pref['buttonTiming'] = value;
    this.saveJson(pref);
  }
}

class EventDispatcher {
  constructor() {
    this._listenersMap = new Map();
  }

  addEventListener(type, callback) {
    if (!this._listenersMap.has(type)) {
      this._listenersMap.set(type, []);
    }

    this._listenersMap.get(type).push(callback);
  }

  // removeEventListenerも必要かもしれんけど
  // 作るのめんどいからパス

  dispatchEvent(type, event) {
    if (this._listenersMap.has(type)) {
      for (const callback of this._listenersMap.get(type)) {
        callback(event);
      }
    }
  }
}

class ParalysisTimer extends EventDispatcher {
  constructor() {
    super();
    this._startTimeMs = performance.now();
    this._elapsedTimeMs = 0;
    this._intervalId = null;

    // 麻痺の最長時間
    // 延長なし60秒、延長あり150秒
    this.PARALYSIS_MAX_MS = 60 * 1000;
    this.PARALYSIS_EXTENDED_MAX_MS = 150 * 1000;

    // デフォルトは60秒
    this._maxMs = this.PARALYSIS_MAX_MS;
    this._remainTimeMs = this._maxMs;
  }

  _clearInterval() {
    if(this._intervalId !== null) {
      clearInterval(this._intervalId);
    }
  }

  start(delayMs = 0) {
    this._clearInterval();

    this._startTimeMs = performance.now() - delayMs;
    this._intervalId = setInterval(() => {
      const elapsedTimeMs = performance.now() - this._startTimeMs;
      const remainTimeMs = Math.max(this._maxMs - elapsedTimeMs, 0);
      const maxTimeMs = this._maxMs;

      this._elapsedTimeMs = elapsedTimeMs;
      this._remainTimeMs = remainTimeMs;
      this.dispatchEvent('tick', { maxTimeMs, remainTimeMs, elapsedTimeMs });
    }, 10); // 仕様上4msが限度
  }

  startAt(epochTime) {
    this._clearInterval();

    this._startTimeMs = epochTime;
    this._intervalId = setInterval(() => {
      const elapsedTimeMs = new Date().getTime() - this._startTimeMs;
      const remainTimeMs = Math.max(this._maxMs - elapsedTimeMs, 0);
      const maxTimeMs = this._maxMs;

      this._elapsedTimeMs = elapsedTimeMs;
      this._remainTimeMs = remainTimeMs;
      this.dispatchEvent('tick', { maxTimeMs, remainTimeMs, elapsedTimeMs });
    }, 10); // 仕様上4msが限度
  }

  stop() {
    this._clearInterval();
  }

  reset() {
    this._startTimeMs = performance.now();
  }

  extend() {
    this._maxMs = this.PARALYSIS_EXTENDED_MAX_MS;
    this._remainTimeMs += 90 * 1000;
    this.dispatchEvent('extend', {});
  }

  unextend() {
    this._maxMs = this.PARALYSIS_MAX_MS;
    this._remainTimeMs -= 90 * 1000;
    this.dispatchEvent('unextend', {});
  }
}

class TimerCanvas {
  constructor(canvas, components = {}) {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d');
    this._paralysisImg = 'paralysisImg' in components ? components.paralysisImg : document.createElement('img');
  }

  // 画面をクリア
  _clear(context) {
    context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  // パイを描画する
  _fillPie(context, params) {
    // デフォルトだと中心右が0ラジアンになるので、少し回転して上方が0ラジアンになるようにする
    const offset = -(Math.PI / 2);

    const centerX = 'centerX' in params ? params.centerX : 0;
    const centerY = 'centerY' in params ? params.centerY : 0;
    const radius = 'radius' in params ? params.radius : 0;
    const startRadian = 'startRadian' in params ? params.startRadian : 0;
    const endRadian = 'endRadian' in params ? params.endRadian : 0;
    const fillStyle = 'fillStyle' in params ? params.fillStyle : 'rgb(226, 185, 18)';
    const strokeStyle = 'strokeStyle' in params ? params.strokeStyle : 'rgb(223, 222, 222)';
    const lineWidth = 'lineWidth' in params ? params.lineWidth : '5';

    // 塗りつぶし
    context.fillStyle = fillStyle;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startRadian + offset, endRadian + offset);
    context.closePath();
    context.fill();

    // ボーダー
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();
  }

  render(maxTimeMs, elapsedTimeMs) {
    this._clear(this._context);

    const centerX = this._canvas.width / 2;
    const centerY = this._canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8; // キャンバスの半分よりよりちょい小さめ

    const elapsedTime = Math.min(elapsedTimeMs, maxTimeMs);
    const startRadian = Math.max(elapsedTime / maxTimeMs * 2 * Math.PI, 0); // マイナスにならないようにする
    const endRadian = 2 * Math.PI;

    // パイの描画
    this._fillPie(this._context, {
      centerX,
      centerY,
      radius,
      startRadian,
      endRadian
    });

    // 麻痺アイコンの描画
    const imageSize = Math.min(centerX, centerY); // キャンバスの半分ぐらいのサイズ

    this._context.drawImage(
        this._paralysisImg,
        centerX - imageSize / 2,
        centerY - imageSize / 2,
        imageSize,
        imageSize
    );
  }
}