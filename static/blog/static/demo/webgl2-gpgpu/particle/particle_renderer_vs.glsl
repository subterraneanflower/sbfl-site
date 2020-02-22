#version 300 es

//
// パーティクル出力用のバーテックスシェーダ
//

// 入力変数
in vec2 particlePosition;

//
// メイン処理
//
void main() {
  gl_PointSize = 2.0;
  gl_Position = vec4(particlePosition, 0.0, 1.0);
}