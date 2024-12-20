export const tsconfigBaseJsonTemplate = `{
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2020",
    "module": "ES2022",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  },
  "include": ["apps/**/*", "libs/**/*"],
  "exclude": ["node_modules", "**/node_modules", "../node_modules"]
}`;
