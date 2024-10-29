#!/usr/bin/env node

//# some of the manual generation could have been done with plugins if i read this earlier: https://github.com/nrwl/nx/issues/28322#issuecomment-2402630258

import { createProject } from './npx/project.js';
import { whatToDo } from './npx/utils/questions.js';

whatToDo().then(async (answer) => answer === 'NEW_PROJECT' && createProject());

// MORE TODOs: mark what commands can be caught and gracefully continue
