#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { OrderServiceStack } from '../lib/order-service-stack'



if(!process.env.CDK_DEPLOY_STAGE || !process.env.CDK_DEPLOY_REGION || !process.env.CDK_DEPLOY_ACCOUNT) {
  throw new Error('CDK_DEPLOY_STAGE, CDK_DEPLOY_REGION and CDK_DEPLOY_ACCOUNT must be defined')
}

const env = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

const stage = process.env.CDK_DEPLOY_STAGE || 'dev'

const app = new cdk.App()

new OrderServiceStack(app, 'OrderServiceStack', {
  env,
  stage
})
