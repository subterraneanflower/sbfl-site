const canvas = document.querySelector('#display');
const canvasContext = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 255;

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

// canvasにスペクトラムバーを描画する
function render(spectrum) {
  // canvasの幅を均等に割り振る
  const barWidth = Math.round(canvas.width / spectrum.length);

  // 色は黒
  canvasContext.fillStyle = 'rgb(60, 60, 60)';

  // 前の描画を消す
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < spectrum.length; i++) {
    // 四角形の描画
    // fillRectは本来左上から幅と高さを指定するが、ここでは左下から指定している
    // やり方は簡単で、高さ（スペクトラムの値）をマイナスにするだけ
    canvasContext.fillRect(barWidth * i, canvas.height, barWidth, -spectrum[i]);
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