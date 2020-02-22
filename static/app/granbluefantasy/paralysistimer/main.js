// 発動からデバフアイコン表示までの時間。この辺り要計測
const CLINCHER_DELAY = 1.19 * 1000; // 発動から麻痺アイコン表示まで1.19秒ぐらい？
const TWOCROWN_DELAY = 3.08 * 1000; // 発動から延長アイコン表示まで3.08秒ぐらい？

const searchParams = new URLSearchParams(window.location.search);
const appConfig = config || {};
const appMode = searchParams.has('roomid') ? 'client' : 'host';
const roomid = appMode === 'client' ? searchParams.get('roomid') : '';

const canvas = document.querySelector('.timer-canvas');
canvas.width = 600;
canvas.height = 600;

const dataStore = new DataStore('GbfParalysisTimer');

const timerOutput = document.querySelector('.timer-output');

const paralysis60Button = document.querySelector('.paralysis-60-button');
const extendButton = document.querySelector('.extend-button');
const unextendButton = document.querySelector('.unextend-button');

const openPreferencesButton = document.querySelector('.pref-button');
const closePreferencesButton = document.querySelector('.close-pref-button');
const preferencesDialog = document.querySelector('.preferences-dialog');

const buttonTimingSelect = document.querySelector('.button-timing-select');
const shareUrlGetButton = document.querySelector('.share-url-button');
const shareUrlInput = document.querySelector('.share-url-input');
const installButton = document.querySelector('.install-button');

const resetButton = document.querySelector('.reset-button');

let socket = null;
let installPrompt = null;

// ServiceWorker登録
if(navigator.serviceWorker) {
  navigator.serviceWorker.register('./serviceworker.js');
}

// メイン処理
(async function main() {
  // インストールプロンプトの抑制
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.disabled = false;
  });

  // タイマーと描画周り
  const timer = new ParalysisTimer();

  const paralysisImg = await loadImageAsync('img/paralysis.svg');
  const timerCanvas = new TimerCanvas(canvas, { paralysisImg });
  timerCanvas.render(1, 0);
  timerOutput.value = '60.00';

  timer.addEventListener('tick', (event) => {
    timerCanvas.render(event.maxTimeMs, event.elapsedTimeMs);
    timerOutput.value = (event.remainTimeMs / 1000).toFixed(2);
  });

  //
  // クライアントモード
  //
  if(appMode === 'client') {
    const mainElement = document.querySelector('main');
    mainElement.classList.add('client-mode');

    if(appConfig.roomServerUrl) {
      const ws = new WebSocket(appConfig.roomServerUrl);

      ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({
          payload: {
            command: 'joinroom',
            roomid
          }
        }));
      });

      ws.addEventListener('message', (event) => {
        try {
          const messageJson = JSON.parse(event.data);
          if(messageJson.status === 'ok') {
            const command = messageJson.payload.command || 'none';

            if(command === 'starttimer') {
              const startEpoch = messageJson.payload.startAt;
              const buttonTiming = messageJson.payload.buttonTiming;
              const delayMs = !buttonTiming || buttonTiming === 'immediate' ? 0 : CLINCHER_DELAY;

              timer.unextend();
              timer.reset();
              timer.startAt(startEpoch + delayMs);
            } else if(command === 'stoptimer') {
              timer.stop();
            } else if(command === 'resettimer') {
              timer.stop();
              timer.reset();
              timer.unextend();
              timerCanvas.render(1, 0);
              timerOutput.value = '60.00';
            } else if(command === 'extendtimer') {
              timer.extend();
            } else if(command === 'unextendtimer') {
              timer.unextend();
            }
          }
        } catch(e) {
          console.error(e);
        }
      });

      ws.addEventListener('close', (event) => {
        if(event.code === 4000) {
          alert('部屋主との接続が切れました。部屋は解散します');
        }
      });

      ws.addEventListener('error', (event) => {
        alert('ルームへの接続に失敗しました')
      });
    }

    return;
  }

  //
  // ホストモード
  //

  function broadcastJson(json) {
    if(socket) {
      try {
        socket.send(JSON.stringify(json));
      } catch(e) {
        console.error('JSON parse error', e);
      }
    }
  }

  // タイマーのモード切り替わったらボタンの有効/無効も切り替える
  timer.addEventListener('extend', (event) => {
    extendButton.disabled = true;
    unextendButton.disabled = false;
  });

  timer.addEventListener('unextend', (event) => {
    extendButton.disabled = false;
    unextendButton.disabled = true;
  });

  // ボタン周りの動作
  extendButton.disabled = true;
  unextendButton.disabled = true;

  paralysis60Button.addEventListener('click', (event) => {
    let delayMs = 0;
    const timing = dataStore.buttonTiming;

    if(timing === 'immediate') {
      delayMs = 0;
    } else if(timing === 'clincher') {
      delayMs = CLINCHER_DELAY;
    }

    extendButton.disabled = false;
    timer.unextend();
    timer.reset();
    timer.start(delayMs);

    broadcastJson({
      payload: {
        broadcastPayload: {
          startAt: new Date().getTime() - delayMs,
          command: 'starttimer'
        }
      }
    });
  });

  extendButton.addEventListener('click', (event) => {
    timer.extend();

    broadcastJson({
      payload: {
        broadcastPayload: { command: 'extendtimer' }
      }
    });
  });

  unextendButton.addEventListener('click', (event) => {
    timer.unextend();

    broadcastJson({
      payload: {
        broadcastPayload: { command: 'unextendtimer' }
      }
    });
  });

  // リセットボタンの動作
  resetButton.addEventListener('click', (event) => {
    timer.stop();
    timer.reset();
    timer.unextend();
    timerCanvas.render(1, 0);
    timerOutput.value = '60.00';
    extendButton.disabled = true;
    unextendButton.disabled = true;

    broadcastJson({
      payload: {
        broadcastPayload: { command: 'resettimer' }
      }
    });
  });

  // 設定ダイアログの操作
  openPreferencesButton.addEventListener('click', (event) => {
    preferencesDialog.dataset['visible'] = 'true';
  });

  closePreferencesButton.addEventListener('click', (event) => {
    delete preferencesDialog.dataset['visible'];
  });

  // 設定ボタンの動作
  buttonTimingSelect.value = dataStore.buttonTiming;
  buttonTimingSelect.addEventListener('change', (event) => {
    dataStore.buttonTiming = buttonTimingSelect.value;
  });

  shareUrlGetButton.addEventListener('click', () => {
    shareUrlGetButton.disabled = true;
    shareUrlInput.value = '取得中です……';

    if(socket) {
      socket.close();
    }

    socket = new WebSocket(appConfig.roomServerUrl);

    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if(message.status === 'ok') {
          if(message.payload.type === 'roomcreated') {
            const roomid = message.payload.roomid;
            const baseurl = location.origin + location.pathname;
            const shareUrl = baseurl + `?roomid=${roomid}`;
            shareUrlInput.value = shareUrl;
          }
        } else {
          shareUrlInput.value = '取得エラー';
          shareUrlGetButton.disabled = false;
          console.error('ルーム作成エラー', message);
        }
      } catch(e) {
        shareUrlInput.value = '取得エラー';
        shareUrlGetButton.disabled = false;
        console.error(e);
      }
    });

    socket.addEventListener('open', (event) => {
      socket.send(JSON.stringify({
        payload: {
          command: 'createroom'
        }
      }));
    });

    socket.addEventListener('error', () => {
      shareUrlInput.value = '接続エラー';
      shareUrlGetButton.disabled = false;
      socket = null;
    });
  });

  shareUrlInput.addEventListener('focus', (event) => {
    shareUrlInput.select();
  });

  // インストール周りの処理
  installButton.addEventListener('click', (event) => {
    if(!installPrompt) {
      return;
    }

    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        installButton.disabled = true;
        gtag('event', 'Add to Homescreen', {'event_category': 'App', 'event_label': 'GBF Paralysis Timer'});
      }

      installPrompt = null;
    });
  });
})();
