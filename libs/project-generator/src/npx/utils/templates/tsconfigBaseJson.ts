export const tsconfigBaseJsonTemplate = `
{
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
    "module": "ES2022",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "pretty": true,
    "removeComments": false,
    "resolveJsonModule": false,
    "skipDefaultLibCheck": false,
    "skipLibCheck": true,
    "sourceMap": false,
    "strict": true,
    "target": "es2022",
    "verbatimModuleSyntax": false
  }
}

`;
