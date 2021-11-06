import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs'
import * as sns from '@aws-cdk/aws-sns'
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions'
import * as sqs from '@aws-cdk/aws-sqs'
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources'
import * as dynamoDb from '@aws-cdk/aws-dynamodb'
import { join } from 'path'
import { Runtime } from '@aws-cdk/aws-lambda'
import { Duration } from '@aws-cdk/core'


export class OrderServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps & { stage: string }) {
    super(scope, id, props)

    const functionsPath = join(__dirname, '..', 'functions')

    const { stage } = props

    // Create OrdersTable

    const ordersTable = new dynamoDb.Table(this, `${stage}OrdersTable`, {
      tableName: 'OrdersTable',
      partitionKey: { name: 'id', type: dynamoDb.AttributeType.STRING}
    })

    // Create SNS topic

    const notificationsTopic = new sns.Topic(this, `${stage}notificationsTopic`, {
      displayName: 'notificationsTopic',
      topicName: 'notificationsTopic',
      contentBasedDeduplication: true,
      fifo: true
    })

    
    // Create SQS queue

    const notificationsQueue = new sqs.Queue(this, `${stage}NotificationsQueue`, {
      queueName: 'NotificationsQueue.fifo',
      fifo: true,
      visibilityTimeout: Duration.seconds(30)
    })


    // Subscribe queue to SNS topic 

    notificationsTopic.addSubscription( new snsSubscriptions.SqsSubscription(notificationsQueue))


    // Create notificationsHandlerLambda

    const notificationsHandlerLambda = new nodeLambda.NodejsFunction(this, `${stage}NotificationsHandlerLambda`, {
      runtime: Runtime.NODEJS_14_X,
      entry: join(functionsPath, 'notificationService/index.ts'),
      handler: 'notificationHandler',
    })

    notificationsHandlerLambda.addEventSource( new lambdaEventSources.SqsEventSource(notificationsQueue))


    // Create orderHandlerLambda 

    const orderHandler = new nodeLambda.NodejsFunction(this, `${stage}OrderHandlerLambda`, {
      runtime: Runtime.NODEJS_14_X,
      entry: join(functionsPath, 'orderService/index.ts'),
      handler: 'orderHandler',
      environment: {
        ORDERS_TABLE: ordersTable.tableName,
        NOTIFICATIONS_TOPIC_ARN: notificationsTopic.topicArn
      }
    })

    // give the lambda the right permissions to the sns topic and the dynamodb table
    ordersTable.grantReadWriteData(orderHandler)
    notificationsTopic.grantPublish(orderHandler)

    // Create a rest api

    const api = new apigateway.LambdaRestApi(this, 'myapi', {
      handler: orderHandler,
      proxy: false
    })

    const orders = api.root.addResource('orders')
    orders.addMethod('POST')

  }
}
