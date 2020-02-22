attribute vec3 vertexPosition;
attribute vec3 color;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 vColor;

void main() {
  vColor = vec4(color, 1.0);

  gl_Position = projection * view * model * vec4(vertexPosition, 1.0);
}