import { firestorePlugin } from 'vuefire';
import Vue from 'vue';
import App from './App.vue';
import vuetifyPlugin from './plugins/vuetify';
import firebasePlugin from './plugins/firebase';
import store from './store';
import router from './router';
import i18n from './i18n';

Vue.config.productionTip = false;

const vuetify = vuetifyPlugin(i18n);

Vue.use(firebasePlugin);
Vue.use(firestorePlugin);

new Vue({
  vuetify,
  store,
  router,
  watch: {
    '$i18n.locale': {
      handler (value) {
        this.$vuetify.lang.current = value;
        window.localStorage.locale = value;
      },
      immediate: false,
    },
  },
  created () {
    const commitSHA = process.env.VUE_APP_GITHUB_SHA;
    console.log(`GitHub commit: ${commitSHA || 'no commit info'}`);
  },
  i18n,
  render: (h) => h(App),
}).$mount('#app');
