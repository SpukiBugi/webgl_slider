import Vue from "vue/dist/vue.esm.js";
import "../scss/index.scss";

import main_vue from "../vue/main.vue";
// import main_vue from "../vue/tutorial.vue";

new Vue({
  el: '#app',

  components: {
    main_vue,
  },

  data: {
    test: "testing"
  },

  mounted() {
  }
})