import { expect as expectCDK, haveResource } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as OrderService from '../lib/order-service-stack'

test('Test creation of AWS::DynamoDB::Table', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new OrderService.OrderServiceStack(app, 'MyTestStack', { stage: 'dev'});
    // THEN
    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table'))
})
