
<!-- ABOUT THE PROJECT -->
## Serverless architecture for asynchronous user notifications.

The purpose of this application is to experiment with serverless on AWS using AWS CDK. the focus is not on the correctness of business logic.

### Developed With

This program is developed on top of:

* [NodeJs](https://nodejs.org/en/)
* [Typescript](https://www.typescriptlang.org/)
* [AWS CDK](https://aws.amazon.com/cdk/)
* AWS services ( Lambda, SNS, SQS, Api gateway, Dynamodb, secrets manager)

### Installation
1. install [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) on your machine
2. run aws configure to set up your account
3. update cdk.json's context with your own account, stage, secretArn and verifiedSender
4. Install dependencies
   ```sh
   npm install
   ```
5. Export below env variables with your information.
   ```JS
   export CDK_DEPLOY_ACCOUNT= '<YOUR_AWS_ACCOUNT>'
   export CDK_DEPLOY_REGION= 'eu-west-1'
   export CDK_DEPLOY_STAGE= 'dev'
   ```
6. Validate if everything works by running
   ```sh
   cdk ls
   ```
7. if this is your first deployment of a cdk stack on your given account run
   ```sh
   cdk bootstrap
   ```
8. To deploy the stack run
   ```sh
   cdk deploy
   ```
9. To destroy the stack on aws run
   ```sh
    npm run destroy
   ```

## Usage

You can send a correct JSON payload to the orders endpoint from the deployed Api gateway stage and see everything in action.

## Contact

Fardin Hakimi - fardinhakimi@gmail.com