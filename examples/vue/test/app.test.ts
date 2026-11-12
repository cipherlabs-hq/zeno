import { createApp, type App as VueApp } from 'vue';
import { signUpContract } from '../../shared/sign-up-contract.js';
import App from '../src/App.vue';

let app: VueApp;

signUpContract(
  target => {
    app = createApp(App);
    app.mount(target);
  },
  () => app.unmount()
);
