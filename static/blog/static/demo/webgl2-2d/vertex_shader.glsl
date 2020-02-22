#version 300 es

in vec2 vertexPosition;
in vec2 textureCoord;

uniform mat4 scaling;
uniform mat4 translation;

out vec2 vTextureCoord;

void main() {
  vTextureCoord = textureCoord;

  gl_Position = translation * scaling * vec4(vertexPosition, 0.0, 1.0);
}