import page from '../index.html?raw';
import { signUpContract } from '../../shared/sign-up-contract.js';
import { start } from '../src/app.js';

signUpContract(target => {
  // The markup of the page, without the document around it.
  target.innerHTML = /<body>([\s\S]*)<\/body>/.exec(page)![1];
  start(target);
});
