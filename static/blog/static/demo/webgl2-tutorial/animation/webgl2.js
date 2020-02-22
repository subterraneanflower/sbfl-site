// Canvasを作成してbodyに追加します。
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');

// シェーダを読み込みPromiseを返します。
function loadShaders() {
    const loadVertexShader = fetch('vertex_shader.glsl').then((res) => res.text());
    const loadFragmentShader = fetch('fragment_shader.glsl').then((res) => res.text());
    return Promise.all([loadVertexShader, loadFragmentShader]);
}

// シェーダのソースからシェーダプログラムを作成し、
// Programを返します。
function createShaderProgram(vsSource, fsSource) {
    // バーテックスシェーダをコンパイルします。
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const vShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if(!vShaderCompileStatus) {
        const info = gl.getShaderInfoLog(vertexShader);
        console.log(info);
    }

    // フラグメントシェーダについても同様にします。
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const fShaderCompileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if(!fShaderCompileStatus) {
        const info = gl.getShaderInfoLog(fragmentShader);
        console.log(info);
    }

    // シェーダプログラムを作成します。
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!linkStatus) {
        const info = gl.getProgramInfoLog(program);
        console.log(info);
    }

    // プログラムを使用します。
    gl.useProgram(program);

    return program
}

// バッファを作成し返します。
function createBuffer(type, typedDataArray) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, typedDataArray, gl.STATIC_DRAW);
    gl.bindBuffer(type, null); // バインド解除

    return buffer;
}

// シェーダを読み込み終わったら開始します。
loadShaders().then((shaderSources) => {
    //
    // プログラムの作成
    //
    const vertexShaderSource = shaderSources[0];
    const fragmentShaderSource = shaderSources[1];

    const program = createShaderProgram(vertexShaderSource, fragmentShaderSource);

    //
    // 設定の有効化
    //
    gl.enable(gl.DEPTH_TEST);

    //
    // uniform変数の設定
    //

    // モデル変換行列。今回は特に何もしません。
    const model = mat4.create();
    mat4.identity(model);

    // ビュー変換行列。
    // 今回はビュー変換行列を変化させ続けて
    // アニメーションを実現するので、ここでは飛ばします。

    // プロジェクション変換行列。
    // 今回はperspectiveメソッドを使用します。
    // これは視野角とアスペクト比、near、far、から
    // 視野錐台を作成してくれるものです。
    const fovY = 60 * Math.PI / 180;
    const aspect = 500 / 500;
    const near = 30;
    const far  = 300;
    const projection = mat4.create();
    mat4.perspective(projection, fovY, aspect, near, far);

    const modelLocation      = gl.getUniformLocation(program, 'model');
    const viewLocation       = gl.getUniformLocation(program, 'view');
    const projectionLocation = gl.getUniformLocation(program, 'projection');
    gl.uniformMatrix4fv(modelLocation, false, model);
    gl.uniformMatrix4fv(projectionLocation, false, projection);

    //
    // 描画データ
    //
    const vertices = new Float32Array([
        -30.0, 30.0, 0.0,   // 座標
        0.0, 1.0, 0.0, 1.0, // 色
        -30.0, -30.0, 0.0,
        1.0, 0.0, 0.0, 1.0,
        30.0, 30.0, 0.0,
        1.0, 0.0, 0.0, 1.0,
        30.0, -30.0, 0.0,
        0.0, 0.0, 1.0, 1.0
    ]);
    const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
    const indexSize = indices.length;

    //
    // バッファの設定
    //
    const vertexBuffer = createBuffer(gl.ARRAY_BUFFER, vertices);
    const indexBuffer = createBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    const vertexAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
    const colorAttribLocation  = gl.getAttribLocation(program, 'color');

    const VERTEX_SIZE = 3; // vec3
    const COLOR_SIZE  = 4; // vec4

    const STRIDE = (3 + 4) * Float32Array.BYTES_PER_ELEMENT;
    const POSITION_OFFSET = 0;
    const COLOR_OFFSET = 3 * Float32Array.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enableVertexAttribArray(vertexAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.vertexAttribPointer(vertexAttribLocation, VERTEX_SIZE, gl.FLOAT, false, STRIDE, POSITION_OFFSET);
    gl.vertexAttribPointer(colorAttribLocation, COLOR_SIZE, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

    //
    // 描画処理
    //

    //
    // 今回の内容は
    // ここに付け足していく
    //
    const radius = 100;
    let radian = 0;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    function loop(timestamp) {
        // 角度を少しずつ変化させます。
        radian += 1.0 * Math.PI / 180;

        // ビュー変換行列を用意します。
        const cameraPosition = [Math.sin(radian)*radius, 100.0, Math.cos(radian)*radius];
        const lookAtPosition = [0, 0, 0];
        const upDirection    = [0.0, 1.0, 0.0];
        const view  = mat4.create();
        mat4.lookAt(view, cameraPosition, lookAtPosition, upDirection);
        gl.uniformMatrix4fv(viewLocation, false, view);

        // 前フレームの内容をクリアします。
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 描画します。
        gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        // 次フレームをリクエストします。
        window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
});