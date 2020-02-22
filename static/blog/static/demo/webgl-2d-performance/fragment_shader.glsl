precision mediump float;

uniform sampler2D texture;

varying vec2 vTextureCoord;

void main() {
  gl_FragColor = texture2D(texture, vTextureCoord);
}