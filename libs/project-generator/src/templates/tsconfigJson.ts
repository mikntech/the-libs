export const tsconfigJsonServerTemplate = `
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    }
  ],
  "compilerOptions": {
    "esModuleInterop": true
  }
}

`;

export const tsconfigJsonNextTemplate = (appName: string) => `
{
 "extends": "../../tsconfig.base.json",
 "compilerOptions": {
   "jsx": "preserve",
   "allowJs": true,
   "esModuleInterop": true,
   "allowSyntheticDefaultImports": true,
   "strict": true,
   "forceConsistentCasingInFileNames": true,
   "noEmit": true,
   "resolveJsonModule": true,
   "isolatedModules": true,
   "incremental": true,
   "plugins": [
     {
       "name": "next"
     }
   ],
   "types": ["node"]
 },
 "include": [
   "**/*.ts",
   "**/*.tsx",
   "**/*.js",
   "**/*.jsx",
   "../../apps/${appName}/.next/types/**/*.ts",
   "../../dist/apps/${appName}/.next/types/**/*.ts",
   "next-env.d.ts"
 ],
 "exclude": ["node_modules", "jest.config.ts"]
}


`;
