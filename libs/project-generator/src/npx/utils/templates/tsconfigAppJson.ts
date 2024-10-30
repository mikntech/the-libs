export const tsconfigAppJsonTemplate = `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "es2022",
    "moduleResolution": "bundler",
    "types": [
      "node"
    ]
  },
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts"
  ],
  "include": [
    "src/**/*.ts"
  ]
}

`;
