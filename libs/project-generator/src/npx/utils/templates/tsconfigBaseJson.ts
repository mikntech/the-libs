export const tsconfigBaseJsonTemplate = `{
  "compilerOptions": {
    "allowJs": false,
    "allowSyntheticDefaultImports": true,
    "composite": true,
    "declaration": true,
    "moduleResolution": "node",
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "emitDecoratorMetadata": false,
    "esModuleInterop": true,
    "experimentalDecorators": false,
    "forceConsistentCasingInFileNames": true,
    "importHelpers": true,
    "incremental": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "es2022",
    "skipLibCheck": true,
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "pretty": true,
    "removeComments": false,
    "resolveJsonModule": false,
    "skipDefaultLibCheck": false,
    "sourceMap": false,
    "target": "es2022",
    "verbatimModuleSyntax": false
  },
  "include": ["apps/**/*", "libs/**/*"],
  "exclude": ["node_modules", "**/node_modules", "../node_modules"]
}`;
