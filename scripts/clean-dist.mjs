// Removes the `dist` folder of the package it is run from, so that a build
// never carries files over from an earlier one (tsc does not delete the
// output of a source file that has since been renamed or removed).

import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

await rm(resolve(process.cwd(), 'dist'), { recursive: true, force: true });
