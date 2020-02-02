<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import fragmentShader from '../glsl/tutorial/fragmentShader.glsl';
import vertexShader from '../glsl/tutorial/vertexShader.glsl';

export default {

  data() {
    return {
      canvas: "",
      gl: "",
    }
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.gl = this.canvas.getContext("webgl");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.gl.clearColor(0.75, 0.85, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
    let verSh = this.gl.createShader(this.gl.VERTEX_SHADER);
    let frSh = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    this.gl.shaderSource(verSh, vertexShader);
    this.gl.shaderSource(frSh, fragmentShader);

    this.gl.compileShader(verSh);

    if (!this.gl.getShaderParameter(verSh, this.gl.COMPILE_STATUS)) {
      console.log("fd up");
    }
    this.gl.compileShader(frSh);
    if (!this.gl.getShaderParameter(frSh, this.gl.COMPILE_STATUS)) {
      console.log("fd up fr");
    }

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, verSh);
    this.gl.attachShader(this.program, frSh);
    this.gl.linkProgram(this.program);

    let triangleVertices = 
    [ // X, Y     // R,G,B
      0.0, 0.5,   1.0, 1.0, 0.0,
      -0.5, -0.5, 0.7, 0.0, 1.0,
      0.5, - 0.5, 0.1, 1.0, 0.6
    ];

    let triangleVertexBufferObject = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, triangleVertexBufferObject);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleVertices), this.gl.STATIC_DRAW);
  
    let positionAttribLoc = this.gl.getAttribLocation(this.program, "vertPosition");
    let colorAttribLoc = this.gl.getAttribLocation(this.program, "vertColor");

    this.gl.vertexAttribPointer(
      positionAttribLoc,
      2,
      this.gl.FLOAT,
      this.gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    ),

    this.gl.vertexAttribPointer(
      colorAttribLoc,
      3,
      this.gl.FLOAT,
      this.gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT,
    )


    this.gl.enableVertexAttribArray(positionAttribLoc);
    this.gl.enableVertexAttribArray(colorAttribLoc);

    this.gl.useProgram(this.program);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}
</script>

<style lang="scss" scoped>

</style>