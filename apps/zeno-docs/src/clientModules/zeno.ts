import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { loadZeno } from '../zeno';

// The pages are written to HTML at build time with the element tags in them.
// In the browser the elements are registered and take those tags over.
if (ExecutionEnvironment.canUseDOM) {
  void loadZeno();
}
