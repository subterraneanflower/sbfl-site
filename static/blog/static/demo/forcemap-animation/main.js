// パーティクルクラス
// 位置(x, y)と加速度(vx, vy)を持つ
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  // 毎フレームパーティクルを動かす
  // フォースマップにしたがった加速度を得る
  update(forcemap) {
    const force = forcemap.getForce(this.x, this.y);
    this.vx += force.x;
    this.vy += force.y;
    this.x += this.vx;
    this.y += this.vy;
  }

  // 点を描画
  render(context) {
    context.strokeStyle = 'white';
    context.strokeRect(this.x, this.y, 1, 1);
  }
}

// フォースマップ
class Forcemap {
  constructor(width, height, meshWidth = 10, meshHeight = 10) {
    this._width = width;
    this._height = height;
    this._meshWidth = meshWidth;
    this._meshHeight = meshHeight;

    // x,yともに-0.5から0.5までの範囲で力場を作る
    this._map = (new Array(width * height))
                    .fill(null)
                    .map((f) => ({ x: -Math.random() + 0.5, y: -Math.random() + 0.5}));
  }

  // x,yで指定された場所の力を取得する
  getForce(x, y) {
    const force = this._map[this._width * Math.floor(y/this._meshHeight) + Math.floor(x/this._meshWidth)];
    return force || { x: 0, y: 0 };
  }

  // 描画する
  render(context) {
    const width = this._width * this._meshWidth;
    const height = this._height * this._meshHeight;

    context.strokeStyle = 'rgb(60, 60, 60)';

    // 各マス目について
    for(let x = 0; x < width; x += this._meshWidth) {
      for(let y = 0; y < height; y+= this._meshHeight) {
        const center = { x: x + this._meshWidth/2, y: y + this._meshHeight/2 }; // マス目の中心
        const meshForce = this.getForce(Math.floor(x), Math.floor(y)); // マス目の力
        const forceSize = Math.sqrt((meshForce.x ** 2) + (meshForce.y ** 2)); // 力の大きさ
        const drawRadius = forceSize * Math.min(this._meshWidth, this._meshHeight); // 描画サイズ
        const radian = Math.atan2(meshForce.y, meshForce.x); // 力の角度

        // 矢印を描く
        context.beginPath();
        context.moveTo(center.x - drawRadius * Math.cos(radian), center.y - drawRadius * Math.sin(radian));
        context.lineTo(center.x + drawRadius * Math.cos(radian), center.y + drawRadius * Math.sin(radian));
        context.lineTo(center.x + drawRadius * Math.cos(radian + Math.PI/2), center.y + drawRadius * Math.sin(radian + Math.PI/2));
        context.lineTo(center.x + drawRadius * Math.cos(radian - Math.PI/2), center.y + drawRadius * Math.sin(radian - Math.PI/2));
        context.lineTo(center.x + drawRadius * Math.cos(radian), center.y + drawRadius * Math.sin(radian));
        context.stroke();

        context.strokeRect(x, y, this._meshWidth, this._meshHeight);
      }
    }
  }
}

const canvasSize = 800;
const canvas = document.createElement('canvas');
canvas.width = canvasSize;
canvas.height = canvasSize;
const context = canvas.getContext('2d');
document.body.appendChild(canvas);

const meshNum = 10;
const meshSize = Math.floor(canvasSize / meshNum);

const forcemap = new Forcemap(meshNum, meshNum, meshSize, meshSize);

const particles = (new Array(200))
    .fill(null)
    .map((n) => new Particle(Math.random()*canvasSize, Math.random()*canvasSize));

// 毎フレームこの関数を実行する
function loop(timestamp) {
  // 描画をクリア
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvasSize, canvasSize);

  // フォースマップの描画
  forcemap.render(context);

  // パーティクルの更新と描画
  for(const p of particles) {
    // フォースマップを与えてアップデート
    p.update(forcemap);

    // 外にはみ出したら適当に中に戻してやる
    if(p.x < 0 || p.x > canvasSize) {
      p.x = Math.random() * canvasSize;
      p.vx = 0;
    }

    if(p.y < 0 || p.y > canvasSize) {
      p.y = Math.random() * canvasSize;
      p.vy = 0;
    }

    // パーティクルを描画
    p.render(context);
  }

  // 次のフレームを要求
  requestAnimationFrame((ts) => loop(ts));
}

// ループ開始！
requestAnimationFrame((ts) =>loop(ts));

