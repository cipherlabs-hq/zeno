import { createRoot, type Root } from 'react-dom/client';
import { signUpContract } from '../../shared/sign-up-contract.js';
import { App } from '../src/App.js';

let root: Root;

signUpContract(
  target => {
    root = createRoot(target);
    root.render(<App />);
  },
  () => root.unmount()
);
