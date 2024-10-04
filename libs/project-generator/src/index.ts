import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit';
import inquirer from 'inquirer';

export default async function generateProject(tree: Tree, schema: any) {
  // Prompt user for input (using inquirer)
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the new project?',
    },
    {
      type: 'list',
      name: 'template',
      message: 'Which template do you want to use?',
      choices: ['react', 'angular', 'node'],
    },
  ]);

  // Perform project generation logic based on the answers
  const projectName = answers.name;
  const template = answers.template;

  // Add files, modify workspace.json, etc.
  // For example, add a project-specific folder
  tree.write(`apps/${projectName}/src/main.ts`, '// Project Main File');

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}
