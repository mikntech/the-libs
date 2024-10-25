export const nxJsonTemplate = `
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.js"
    ],
    "sharedGlobals": []
  },
  "plugins": [
    {
      "plugin": "@nx/js/typescript",
      "options": {
        "build": {
          "targetName": "build",
          "configName": "tsconfig.lib.json"
        }
      }
    },
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    },
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "startTargetName": "start",
        "buildTargetName": "build",
        "devTargetName": "dev",
        "serveStaticTargetName": "serve-static"
      }
    }
  ],
  "targetDefaults": {
    "@nx/esbuild:esbuild": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  },
  "generators": {
    "@nx/next": {
      "application": {
        "style": "scss",
        "linter": "eslint"
      }
    }
  }
}

`;
