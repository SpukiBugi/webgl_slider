<template>
  
</template>

<script>
import * as THREE from 'three';

export default {
  name: "cube",

  data() {
    return {
      geometry: "",
      material: "",
      mesh: "",
    }
  },

  mounted() {
    this.initMesh();
  },

  methods: {
    // Инициализация меша
    initMesh() {
      this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
      this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      this.mesh = new THREE.Mesh( this.geometry, this.material );
      this.mesh.position.x = 1;
      
      this.$parent.scene.add( this.mesh );
      this.animateCube();
    },

    animateCube() {
      requestAnimationFrame( this.animateCube );
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.$parent.renderer.render( this.$parent.scene, this.$parent.camera );
    },
  }
}
</script>

<style>

</style>