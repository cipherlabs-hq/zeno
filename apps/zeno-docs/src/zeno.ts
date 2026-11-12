/**
 * Loads and registers the Zeno elements. They need a browser, so this is
 * only ever called there: from the client module when a page opens, and from
 * an example before its script runs.
 */
let loading: Promise<unknown> | undefined;

export function loadZeno(): Promise<unknown> {
  loading ??= import('@usezeno/core/web-components');
  return loading;
}
