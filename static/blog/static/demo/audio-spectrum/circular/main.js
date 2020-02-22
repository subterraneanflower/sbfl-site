const canvas = document.querySelector('#display');
const canvasContext = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

// 音楽ファイルをdataURLに変換する
// Promise<string>を返す
async function convertAudioFileToDataUrl(file) {
  const reader = new FileReader();

  const loadPromise = new Promise((resolve, reject) => {
    reader.onload = (event) => {
      resolve(event.target.result);
    };
  });

  reader.readAsDataURL(file);

  return loadPromise;
}

// canvasにスペクトラムを描画する
function render(spectrum) {
  // canvasの中心座標
  const center = { x: Math.round(canvas.width / 2), y: Math.round(canvas.height/2) };

  // canvasの幅を均等に割り振る
  // 円なので360度（2π）を分割する
  const barRad = 2 * Math.PI / spectrum.length;

  // 円の半径
  const innerRadius = 60;
  const outerRadius = 250;
  const diffRadius = outerRadius - innerRadius;

  // 前の描画を消す
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < spectrum.length; i++) {
    // 色相を回転
    const barDegree = barRad * i * 180 / Math.PI;
    canvasContext.fillStyle = `hsl(${barDegree}, 80%, 60%)`;

    // バーの開始角度・終了角度を計算
    const startRad = barRad * i;
    const endRad = barRad * (i + 1);

    // バーの開始点・終了点を計算
    const startX = center.x + innerRadius * Math.cos(startRad);
    const startY = center.y + innerRadius * Math.sin(startRad);
    const endX = center.x + innerRadius * Math.cos(endRad);
    const endY = center.y + innerRadius * Math.sin(endRad);

    // 値からバーの長さを計算
    const normalizedSpectrum = spectrum[i] / 255; // 0.0から1.0までの値に変換する。最大255なので255で割ればいい
    const barRadius = normalizedSpectrum * diffRadius + innerRadius;

    // 描画開始
    canvasContext.beginPath();

    // まず円弧を描く
    canvasContext.arc(center.x, center.y, innerRadius, startRad, endRad);

    // 次にバーを描く
    // バーの半径から外円上の点を割り出し、
    // 内円から外円へ四角形を描く
    canvasContext.moveTo(startX, startY);
    canvasContext.lineTo(barRadius * Math.cos(startRad) + center.x, barRadius * Math.sin(startRad) + center.y);
    canvasContext.lineTo(barRadius * Math.cos(endRad) + center.x, barRadius * Math.sin(endRad) + center.y);
    canvasContext.lineTo(endX, endY);

    // 塗る
    canvasContext.fill();
  }
}

// ファイルが選択されたら
const fileInput = document.querySelector('#file-input');

let audio = null;
let audioSource = null;
let intervalId = null;

fileInput.addEventListener('change', async (event) => {
  // Web Audio API周りの準備
  const audioContext = new AudioContext();
  const analyzerNode = audioContext.createAnalyser(); // 音分析ノード

  // 2回目以降のときは、前のオーディとタイマーを破棄してから処理にうつる
  if(audio) {
    audio.pause();
    audio.src = '';
  }

  if(audioSource) {
    audioSource.disconnect();
  }

  if(intervalId) {
    clearInterval(intervalId);
  }

  // FFTのウィンドウサイズ
  // 値は2の累乗（2, 4, 8, 16, 32, ...）
  analyzerNode.fftSize = 128;

  const file = fileInput.files[0];
  if(file) {
    // スペクトラムを保持するUint8Arrayを用意
    // サイズはfftSizeの半分（＝frequencyBinCount）
    const spectrumArray = new Uint8Array(analyzerNode.frequencyBinCount);

    // 選択されたファイルをdataURLにしてaudio要素に突っ込む
    audio = new Audio();
    audio.src = await convertAudioFileToDataUrl(file);

    // 選択ファイル -> 分析ノード -> 出力（スピーカー）
    // の順でつなぐ
    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyzerNode);
    analyzerNode.connect(audioContext.destination);

    // 定期的に値を見て描画する
    // requestAnimationFrameでもok
    intervalId = setInterval((event) => {
      // ノードから周波数データを取り出す
      analyzerNode.getByteFrequencyData(spectrumArray);

      // 描画する
      render(spectrumArray);
    }, 1/60);

    // 再生開始
    audio.play();
  }
});