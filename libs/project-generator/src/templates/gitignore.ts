export const dotGitIgnoreTemplate = `
  # See http://help.github.com/ignore-files/ for more about ignoring files.


# Secrets and env
.env


# compiled output
dist
tmp
/out-tsc


# dependencies and platform
node_modules
package-lock.json


# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace


# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json


# Misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

# Cache
.nx

# Next.js
.next
out
`;
