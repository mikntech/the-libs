export const projectJsonTemplate = (appName: string) => `
{
  "name": "${appName}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/${appName}/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "outputs": [
        "{options.outputPath}"
      ],
      "defaultConfiguration": "production",
      "options": {
        "platform": "node",
        "outputPath": "dist/apps/${appName}",
        "format": [
          "esm"
        ],
        "bundle": true,
        "main": "apps/${appName}/src/index.ts",
        "tsConfig": "apps/${appName}/tsconfig.app.json",
        "external": [
          "aws-sdk",
          "mock-aws-s3",
          "nock"
        ],
        "esbuildOptions": {
          "sourcemap": true,
          "outExtension": {
            ".js": ".mjs"
          }
        }
      },
      "configurations": {
        "development": {},
        "production": {
          "esbuildOptions": {
            "sourcemap": false,
            "minify": true,
            "outExtension": {
              ".js": ".mjs"
            }
          }
        }
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "${appName}:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "${appName}:build:development"
        },
        "production": {
          "buildTarget": "${appName}:build:production"
        }
      },
      "dependsOn": [
        {
          "projects": "dependencies",
          "target": "build"
        }
      ]
    }
  },
  "tags": []
}
`;
