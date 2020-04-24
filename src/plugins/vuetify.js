import Vue from 'vue';
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib';
import VuetifyToast from 'vuetify-toast-snackbar';
import pl from 'vuetify/es5/locale/pl';
import { Ripple } from 'vuetify/lib/directives';

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon,
  },
  directives: {
    Ripple,
  },
});

Vue.use(VuetifyToast, {
  queueable: true,
  color: 'accent',
});

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      options: {
        customProperties: true,
      },
      light: {
        primary: '#92de8b',
        secondary: '#0ab68b',
        accent: '#028174',
        lesson: '#2E9599',
        homework: '#ffe75e',
        test: '#F46C3F',
      },
      dark: {
        primary: '#92de8b',
        secondary: '#0ab68b',
        accent: '#028174',
        lesson: '#2E9599',
        homework: '#ffe75e',
        test: '#F46C3F',
      },
    },
  },
  lang: {
    locales: { pl },
    current: 'pl',
  },
});
