'use strict';

(async function main() {
    // Canvasの準備。
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
    
    const gl = canvas.getContext('webgl2');

    //
    // リソースの読み込み。
    //

    // シェーダソースの読み込み。
    const vertexShaderSource = await fetch('vertex_shader.glsl').then((response) => response.text());
    const fragmentShaderSource = await fetch('fragment_shader.glsl').then((response) => response.text());

    // テクスチャの読み込み。
    const textureData = await fetch('atlas.png')
        .then((response) => response.blob())
        .then((blob) => createImageBitmap(blob));

    const textureWidth = textureData.width;
    const textureHeight = textureData.height;

    //
    // シェーダプログラムの用意。
    //

    // シェーダのコンパイル。
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const vShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if(!vShaderCompileStatus) {
        const info = gl.getShaderInfoLog(vertexShader);
        console.log(info);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const fShaderCompileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if(!fShaderCompileStatus) {
        const info = gl.getShaderInfoLog(fragmentShader);
        console.log(info);
    }

    // シェーダプログラムの作成。
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!linkStatus) {
        const info = gl.getProgramInfoLog(program);
        console.log(info);
    }

    // プログラムの使用。
    gl.useProgram(program);

    //
    // バッファの作成。
    //

    // 頂点バッファ：[座標(vec2)][テクスチャ座標(vec2)]
    const vertexBuffer      = gl.createBuffer();

    // インデックスバッファ
    const indexBuffer = gl.createBuffer();

    // 頂点バッファ。頂点ごとの情報を保存する。
    // 今回は2次元座標しか扱わないので座標のsizeは2。
    // strideは頂点情報のサイズなのでvec2+vec2で4。
    // offsetはstride内での位置なので各々計算する。
    // strideもoffsetもバイト数で指定する。
    const STRIDE               = Float32Array.BYTES_PER_ELEMENT * 4;
    const TEXTURE_OFFSET       = Float32Array.BYTES_PER_ELEMENT * 2;

    const POSITION_SIZE      = 2;
    const TEXTURE_SIZE       = 2;

    // 操作対象のバッファをbindしてから作業をする。
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 各頂点情報の位置。
    const vtxAttrLocation      = gl.getAttribLocation(program, 'vertexPosition');
    const textureCoordLocation = gl.getAttribLocation(program, 'textureCoord');

    // 各頂点情報の有効化。
    gl.enableVertexAttribArray(vtxAttrLocation);
    gl.enableVertexAttribArray(textureCoordLocation);

    // 各頂点情報の情報指定。
    gl.vertexAttribPointer(vtxAttrLocation, POSITION_SIZE, gl.FLOAT, false, STRIDE, 0);
    gl.vertexAttribPointer(textureCoordLocation, TEXTURE_SIZE, gl.FLOAT, false, STRIDE, TEXTURE_OFFSET);

    //
    // シェーダのuniform変数の設定。
    //

    // デフォルトの状態だとxy座標ともに[-1.0, 1.0]が表示されるので、
    // 2Dグラフィックスで一般的な[0.0, width or height]座標に変換する。
    const xScale = 2.0/CANVAS_WIDTH;
    const yScale = -2.0/CANVAS_HEIGHT; // 上下逆

    const scalingMatrix = new Float32Array([
        xScale, 0.0   , 0.0, 0.0,
        0.0   , yScale, 0.0, 0.0,
        0.0   , 0.0   , 1.0, 0.0,
        0.0   , 0.0   , 0.0, 1.0
    ]);

    // (0, 0)が中心になってしまうので左上に持ってきてやる。
    const translationMatrix = new Float32Array([
        1.0, 0.0 , 0.0, 0.0,
        0.0, 1.0 , 0.0, 0.0,
        0.0, 0.0 , 1.0, 0.0,
        -1.0, 1.0 , 0.0, 1.0
    ]);

    const scalingLocation = gl.getUniformLocation(program, 'scaling');
    const translationLocation = gl.getUniformLocation(program, 'translation');
    gl.uniformMatrix4fv(translationLocation, false, translationMatrix);
    gl.uniformMatrix4fv(scalingLocation, false, scalingMatrix);

    //
    // テクスチャの転送。
    //

    const texture = gl.createTexture();     // テクスチャの作成
    gl.bindTexture(gl.TEXTURE_2D, texture); // テクスチャのバインド
    gl.texImage2D(gl.TEXTURE_2D, 0,
                  gl.RGBA, gl.RGBA,
                  gl.UNSIGNED_BYTE, textureData); // テクスチャデータの転送
    gl.generateMipmap(gl.TEXTURE_2D); // ミップマップの作成

    // 使用するテクスチャの指定。
    const textureLocation = gl.getUniformLocation(program, 'tex');
    gl.uniform1i(textureLocation, 0);

    //
    // アルファブレンドを有効にする。
    //
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    //
    // 描画に用いるデータ。
    //

    // スプライトファイル上のどの領域か。
    const mikoSpriteRect = { x:32, y:0, width:16, height:16 };
    const fairySpriteRect = { x:48, y:0, width:16, height:16 };

    // 各キャラクターの情報。
    const miko = { x:250, y:300, sprite:mikoSpriteRect };
    const fairy = { x:250, y:100, sprite:fairySpriteRect };

    const actors = [miko, fairy];

    //
    // 描画をループさせてアニメーションを作る。
    //

    let mikoVelocity = 2;

    // ループ。
    function loop(timestamp) {
        // 巫女の移動。
        // 端に到達したら反転。
        miko.x += mikoVelocity;
        if(miko.x < 0 ) {
            miko.x = 0;
            mikoVelocity = -mikoVelocity;
        } else if(miko.x > CANVAS_WIDTH) {
            miko.x = CANVAS_WIDTH;
            mikoVelocity = -mikoVelocity;
        }

        //
        // 描画。
        //

        // 画面をクリア。
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 描画に使う頂点情報。
        const vertices = [];
        const indices = [];

        for(let i = 0; i < actors.length; i++) {
            const a = actors[i];
            const s = a.sprite;

            // 4頂点で四角形を描く。
            // テクスチャ座標は0.0〜1.0に正規化しておく。
            vertices.push(
                a.x, a.y,                                         // 座標
                s.x/textureWidth, s.y/textureHeight,              // テクスチャ座標
                a.x, a.y + s.height,                              // 座標
                s.x/textureWidth, (s.y + s.height)/textureHeight, // テクスチャ座標
                a.x + s.width, a.y,
                (s.x + s.width)/textureWidth, s.y/textureHeight,
                a.x + s.width, a.y + s.height,
                (s.x + s.width)/textureWidth, (s.y + s.height)/textureHeight
            );

            // 4頂点分のインデックス。
            // 縮退三角形で繋ぐ。
            const offset = i * 4;
            if(i > 0) { indices.push(offset); }
            indices.push(offset, offset+1, offset+2, offset+3);
            if(i < actors.length - 1) { indices.push(offset+3); }
        }

        // 描画する。
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

        gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();

        // 次のフレームを要求。
        window.requestAnimationFrame((ts) => loop(ts));
    }

    window.requestAnimationFrame((ts) => loop(ts));
})();