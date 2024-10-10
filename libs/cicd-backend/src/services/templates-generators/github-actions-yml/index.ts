interface Options {
  name: string;
  branchName: string;
  bumpVersion: boolean;
  bumpName: string;
  bumpMessage: string;
  appNames: string[];
  clusterName: string;
  log: boolean;
}

export const generateYML = (
  options: Partial<Options>,
  bumpEmail: string,
  projectName: string,
  region: string,
) => {
  let {
    name,
    branchName,
    bumpVersion,
    bumpName,
    bumpMessage,
    appNames,
    clusterName,
    log,
  } = options;
  if (name === undefined) name = 'prd - release';
  if (branchName === undefined) branchName = 'release/prod';
  if (bumpVersion === undefined) bumpVersion = true;
  if (bumpName === undefined) bumpName = 'GitHub Action';
  if (bumpMessage === undefined)
    bumpMessage = 'CI/CD Version auto-increment to $NEW_VERSION [skip ci]';
  if (appNames === undefined) appNames = ['server', 'client'];
  if (clusterName === undefined) clusterName = 'prod';
  if (log === undefined) log = true;
  const ret =
    `
name: ${name}

on:
  push:
    branches:
      - ${branchName}

permissions:
  actions: read
  contents: read

jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      dep_hash: \${{ steps.dep_hash.outputs.DEP_HASH }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 1
          ssh-key: \${{ secrets.MiK_ACTIONS_DEPLOY_KEY }}

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'

` +
    (bumpVersion
      ? `
      - name: Bump version in package.json
        run: |
          npm version patch --no-git-tag-version
          NEW_VERSION=$(node -p "require('./package.json').version")
          git config --global user.email "${bumpEmail}"
          git config --global user.name "${bumpName}"
          git commit -am "${bumpMessage}"
          git tag v$NEW_VERSION

      - name: Set up Git with SSH for pushing
        run: |
          mkdir -p ~/.ssh
          echo "\${{ secrets.MiK_ACTIONS_DEPLOY_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan github.com >> ~/.ssh/known_hosts
          git config user.name '${bumpMessage}'
          git config user.email '${bumpName}'
          git push git@github.com:\${{ github.repository }} HEAD:\${{ github.ref_name }}
`
      : '') +
    `

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: \${{ secrets.MIK_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.MIK_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${region}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Extract version from package.json
        run: |
          echo "VERSION=$(cat package.json | jq -r .version)" >> $GITHUB_ENV

      - name: Calculate dependencies hash
        id: dep_hash
        run: |
          jq 'del(.version)' package.json > temp_package.json
          echo "DEP_HASH=$(cat temp_package.json | sha256sum | cut -d' ' -f1)" >> $GITHUB_ENV
          rm temp_package.json

      - name: Check if base image exists
        id: check_base_image
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        run: |
          IMAGE="\${ECR_REGISTRY}/mik${projectName}/base:\${DEP_HASH}"
          if docker manifest inspect $IMAGE > /dev/null 2>&1; then
            echo "BASE_IMAGE_EXISTS=true" >> $GITHUB_ENV
            echo "Image $IMAGE exists."
          else
            echo "BASE_IMAGE_EXISTS=false" >> $GITHUB_ENV
            echo "Image $IMAGE does not exist."
          fi

      - name: Build, tag, and push base image to Amazon ECR
        if: env.BASE_IMAGE_EXISTS == 'false'
        env:
          DOCKER_BUILDKIT: 1
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -t $ECR_REGISTRY/mik${projectName}/base:\${DEP_HASH} -f ./Dockerfile .
          docker push $ECR_REGISTRY/mik${projectName}/base:\${DEP_HASH}
` +
    appNames
      .map(
        (appName) =>
          `
          
  build_${appName}:
    needs: prepare
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 1

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: \${{ secrets.MIK_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.MIK_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${region}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Extract version from package.json
        run: |
          echo "VERSION=$(cat package.json | jq -r .version)" >> $GITHUB_ENV

      - name: Calculate dependencies hash
        id: dep_hash
        run: |
          jq 'del(.version)' package.json > temp_package.json
          echo "DEP_HASH=$(cat temp_package.json | sha256sum | cut -d' ' -f1)" >> $GITHUB_ENV
          rm temp_package.json

      - name: Build, tag, and push ${appName} image to Amazon ECR
        env:
          DOCKER_BUILDKIT: 1
        run: |
          ECR_REGISTRY=\${{ steps.login-ecr.outputs.registry }}
          docker build --build-arg DEP_HASH=\${DEP_HASH} -t $ECR_REGISTRY/mik${projectName}/${appName}:$VERSION -f ./apps/${appName}/Dockerfile .
          docker push $ECR_REGISTRY/mik${projectName}/${appName}:$VERSION
          
    `,
      )
      .join('') +
    `
    
  deploy_to_ecs:
    needs: [ prepare, ${appNames.map((appName, index) => (index === 0 ? '' : ' ') + 'build_' + appName)} ]
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: \${{ secrets.MIK_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.MIK_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${region}

      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 1

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'

      - name: Extract version from package.json
        run: |
          echo "VERSION=$(cat package.json | jq -r .version)" >> $GITHUB_ENV

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: \${{ secrets.MIK_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.MIK_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${region}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

` +
    appNames
      .map(
        (appName) =>
          `
          
      - name: Fetch current ${appName} task definition
        id: current-task-def-${appName}
        run: |
          aws ecs describe-task-definition --task-definition ${appName} > mik-current-${appName}-task-def.json

      - name: Update task definition for ${appName}
        run: |
          jq --arg image_tag "$VERSION" --arg ecr_registry "\${{ steps.login-ecr.outputs.registry }}" '.taskDefinition.containerDefinitions[0].image = $ecr_registry + "/mik${projectName}/${appName}:" + $image_tag' mik-current-${appName}-task-def.json > mik-intermediate-${appName}-task-def.json
          jq '.taskDefinition | del(.taskDefinitionArn, .status, .revision, .registeredAt, .registeredBy, .requiresAttributes, .compatibilities)' mik-intermediate-${appName}-task-def.json > mik-final-${appName}-task-def.json

      - name: Register task definition for ${appName}
        id: register-task-def-${appName}
        run: |
          MIK_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://mik-final-${appName}-task-def.json | jq -r '.taskDefinition.taskDefinitionArn')
          echo "MIK_TASK_DEF_ARN_SERVER=$MIK_TASK_DEF_ARN" >> $GITHUB_ENV

      - name: Update ECS Service for ${appName}
        run: |
          aws ecs update-service --cluster ${'mik' + clusterName} --service ${appName} --task-definition $MIK_TASK_DEF_ARN_SERVER

`,
      )
      .join('');
  log && console.log(ret);
  return ret;
};
