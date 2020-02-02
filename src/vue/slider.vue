<template>
  <div class="switchers">
    <div class="prev" @click="next(-1)">-</div>
    <div class="next" @click="next(1)">+</div>
  </div>
</template>

<script>
import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from '../glsl/slider/vertexShader.glsl';
import fragmentShader from '../glsl/slider/fragmentShader.glsl';

export default {
  name: "slider",

  slides: ["/img/transit_1.jpg", "/img/transit_2.jpg", "/img/transit_3.jpg"],

  data() {
    return {
      slide: 0,
      paused: false,
      duration: 1.5,
      easing: 'easeOut',

      textures: [],
      geometry: "",
      material: "",
      mesh: "",
    }
  },

  mounted() {
    this.loadTextures();

    // window.addEventListener("click", this.animation);
  },

  methods: {
    // Инициализация меша
    initMesh() {
      this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

      const loader = new THREE.TextureLoader();

      let next = loader.load(this.$options.slides[this.slide + 1]);
      let image = loader.load(this.$options.slides[this.slide], () => {
        console.log("image", image.image);
        let duration = 1.5;
        let debug = true;
        let easing = 'easeOut';
        this.uniforms = {
          width: {value: 0.5, type:'f', min:0, max:10},
          scaleX: {value: 40, type:'f', min:0.1, max:60},
          scaleY: {value: 40, type:'f', min:0.1, max:60},
          // border: {value: 1, type:'f', min:0., max:1},

          
        };

        this.material = new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          defines: {
              PR: window.devicePixelRatio.toFixed(1)
          }
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.$parent.scene.add( this.mesh );

        this.animation();
      });
    },

    loadTextures() {
      const promises = [];
      this.$options.slides.forEach((url,i)=>{
        let promise = new Promise(resolve => {
          this.textures[i] = new THREE.TextureLoader().load( url, resolve );
        });
        promises.push(promise);
      })

      Promise.all(promises).then(() => {
        this.setupResize();
        this.addObjects();
        this.resize();
        this.clickEvent();
        this.play();
      });
    },

    addObjects() {
      this.material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { type: "f", value: 0 },
          progress: { type: "f", value: 0 },
          border: { type: "f", value: 0 },
          intensity: { type: "f", value: 0 },
          transition: { type: "f", value: 40 },
          swipe: { type: "f", value: 0 },
          radius: { type: "f", value: 0 },
          texture1: { type: "f", value: this.textures[0] },
          texture2: { type: "f", value: this.textures[1] },
          displacement: { type: "f", value: new THREE.TextureLoader().load('/img/disp1.jpg') },
          resolution: { type: "v4", value: new THREE.Vector4() },
          width: {value: 0.5, type:'f', min:0, max:10},
          scaleX: {value: 40, type:'f', min:0.1, max:60},
          scaleY: {value: 40, type:'f', min:0.1, max:60},
          direction: { type: "f", value: 0 },
        },
        // wireframe: true,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      });

      this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2);

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.$parent.scene.add( this.mesh );
    },

    clickEvent(){
      // window.addEventListener('click',()=>{
      //   this.next();
      // })
    },

    setupResize() {
      window.addEventListener("resize", this.resize.bind(this));
    },

    resize() {
      // image cover
      this.imageAspect = this.textures[0].image.height/this.textures[0].image.width;
      let a1; let a2;
      if(this.$parent.height/this.$parent.width > this.imageAspect) {
        console.log("")
        a1 = (this.$parent.width/this.$parent.height) * this.imageAspect;
        a2 = 1;
      } else{
        a1 = 1;
        a2 = (this.$parent.height/this.$parent.width) / this.imageAspect;
      }

      this.material.uniforms.resolution.value.x = this.$parent.width;
      this.material.uniforms.resolution.value.y = this.$parent.height;
      this.material.uniforms.resolution.value.z = a1;
      this.material.uniforms.resolution.value.w = a2;

      const dist  = this.$parent.camera.position.z;
      const height = 1;
      this.$parent.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

      this.$parent.scene.scale.x = this.$parent.camera.aspect;
      this.$parent.scene.scale.y = 1;

      this.$parent.camera.updateProjectionMatrix();
    },

    stop() {
      this.paused = true;
    },

    play() {
      this.paused = false;
      this.render();
    },

    next(direction){
      if(this.isRunning) return;
      this.isRunning = true;
      let len = this.textures.length;
      let nextTexture;
      console.log(len, this.slide);

      if (this.slide + direction === len) {
        this.slide = 0;
      } else if (this.slide + direction < 0) {
        this.slide = len - 1;
      } else {
        this.slide += direction;
      }

      if (direction === 1) {
        this.material.uniforms.direction.value = 0.0;
      } else {
        this.material.uniforms.direction.value = 1.0;
      }

      nextTexture =this.textures[this.slide];
      this.material.uniforms.texture2.value = nextTexture;
      let tl = gsap.timeline();
      tl.to(this.material.uniforms.progress,this.duration,{
        value:1,
        ease: this.easing,
        onComplete:()=>{
          this.current = this.slide + 1;
          this.material.uniforms.texture1.value = nextTexture;
          this.material.uniforms.progress.value = 0;
          this.isRunning = false;
      }})
    },

    render() {
      if (this.paused) return;
      requestAnimationFrame( this.render );
      
      this.material.uniforms.time.value += 0.05;

      this.$parent.renderer.render( this.$parent.scene, this.$parent.camera );
    },
  }
}
</script>

<style lang="scss" scoped>
.switchers {
  position: absolute;
  bottom: 20px;
  left: 50%;
  display: flex;
  justify-content: space-between;
  color: aqua;
  width: 30px;
  user-select: none;

  > div {
    cursor: pointer;
  }
}
</style>