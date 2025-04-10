#!/usr/bin/env node

//# some of the manual generation could have been done with plugins if I read this earlier: https://github.com/nrwl/nx/issues/28322#issuecomment-2402630258

import { createProject } from './npx/project.js';
import { WhatToDo, whatToDo } from './npx/utils/questions.js';
import { createApp, createSingleApp } from './npx/app.js';
import { doCommand } from './npx/utils/commands.js';

const npx = async () => {
  const answer = await whatToDo();
  switch (answer) {
    case WhatToDo.NEW_PROJECT:
      createProject().then();
      break;
    case WhatToDo.NEW_APP:
      createSingleApp().then();
      break;
    case WhatToDo.NEW_LIB:
      // createLib().then();
      doCommand('echo not implemented yet');
      break;
  }
};

npx();

// MORE TODOs: mark what commands can be caught and gracefully continue
