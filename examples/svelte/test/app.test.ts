import { mount, unmount } from 'svelte';
import { signUpContract } from '../../shared/sign-up-contract.js';
import App from '../src/App.svelte';

let app: ReturnType<typeof mount>;

signUpContract(
  target => {
    app = mount(App, { target });
  },
  () => unmount(app)
);
