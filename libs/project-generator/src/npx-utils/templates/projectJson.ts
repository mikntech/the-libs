export const projectJsonServerTemplate = (appName: string) => `
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

export const projectJsonNextTemplate = (appName: string) => `
{
 "name": "${appName}",
 "$schema": "../../node_modules/nx/schemas/project-schema.json",
 "sourceRoot": "apps/${appName}",
 "projectType": "application",
 "tags": [],
 "targets": {
   "build": {
     "executor": "@nx/next:build",
     "outputs": ["{options.outputPath}"],
     "options": {
       "root": "apps/${appName}",
       "outputPath": "dist/apps/${appName}",
       "fileReplacements": [
         {
           "replace": "apps/${appName}/src/environments/environment.ts",
           "with": "apps/${appName}/src/environments/environment.prod.ts"
         }
       ]
     },
     "configurations": {
       "production": {
         "optimization": true,
         "sourceMap": false,
         "extractCss": true,
         "namedChunks": false
       }
     }
   },
   "serve": {
     "executor": "@nx/next:server",
     "options": {
       "buildTarget": "${appName}:build"
     }
   },
   "lint": {
     "executor": "@nx/linter:eslint",
     "options": {
       "lintFilePatterns": ["apps/${appName}/**/*.{ts,tsx}"]
     }
   }
 }
}

`;
