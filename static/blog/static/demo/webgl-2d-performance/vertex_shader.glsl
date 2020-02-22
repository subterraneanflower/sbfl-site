attribute vec2 vertexPosition;
attribute vec2 textureCoord;
attribute vec4 rotation;
attribute vec2 rotationAxis;

uniform mat4 scaling;
uniform mat4 translation;

varying vec2 vTextureCoord;

void main() {
  vTextureCoord = textureCoord;
  
  mat4 rotationMat = mat4(rotation.x, rotation.y, 0.0, 0.0,
                          rotation.z, rotation.w, 0.0, 0.0,
                          0.0       , 0.0       , 1.0, 0.0,
                          0.0       , 0.0       , 0.0, 1.0);
                          
  mat4 trans = mat4(1.0, 0.0, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    rotationAxis.x, rotationAxis.y, 0.0, 1.0);   
                                      
  mat4 reverseTrans = mat4(1.0, 0.0, 0.0, 0.0,
                           0.0, 1.0, 0.0, 0.0,
                           0.0, 0.0, 1.0, 0.0,
                           -rotationAxis.x, -rotationAxis.y, 0.0, 1.0);
  
  gl_Position = translation * scaling * trans * rotationMat * reverseTrans * vec4(vertexPosition, 0.0, 1.0);
}