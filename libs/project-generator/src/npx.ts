#!/usr/bin/env node

//# some of the manual generation could have been done with plugins if i read this earlier: https://github.com/nrwl/nx/issues/28322#issuecomment-2402630258

import { createProject } from './npx/project.js';

createProject().then();

// MORE TODOs: mark what commands can be caught and gracefully continue
