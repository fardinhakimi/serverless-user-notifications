import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs'
import * as sns from '@aws-cdk/aws-sns'
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions'
import * as sqs from '@aws-cdk/aws-sqs'
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources'
import * as dynamoDb from '@aws-cdk/aws-dynamodb'
import * as secretsManager from '@aws-cdk/aws-secretsmanager'
import { join } from 'path'
import { Runtime } from '@aws-cdk/aws-lambda'
import { Duration, RemovalPolicy } from '@aws-cdk/core'

type Config = Record<string, { 
  secretArn: string
  verifiedSender: string
}>


export class OrderServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps & { stage: string }) {
    super(scope, id, props)

    const functionsPath = join(__dirname, '..', 'functions')

    const { stage } = props

    // Create OrdersTable

    const ordersTable = new dynamoDb.Table(this, `${stage}OrdersTable`, {
      tableName: 'OrdersTable',
      partitionKey: { name: 'id', type: dynamoDb.AttributeType.STRING},
      removalPolicy: RemovalPolicy.DESTROY
    })

    // Create SNS topic

    const orderCreatedTopic = new sns.Topic(this, `${stage}orderCreatedTopic`, {
      displayName: 'orderCreatedTopic',
      topicName: 'orderCreatedTopic',
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

    orderCreatedTopic.addSubscription( new snsSubscriptions.SqsSubscription(notificationsQueue))

    // Get config for current stage

    const config = this.node.tryGetContext(props?.env?.account!) as Config

    const secret = secretsManager.Secret.fromSecretCompleteArn(this, `${stage}-notifications-secrets`, config[stage].secretArn)

    // Create notificationsHandlerLambda

    const notificationsHandlerLambda = new nodeLambda.NodejsFunction(this, `${stage}NotificationsHandlerLambda`, {
      runtime: Runtime.NODEJS_14_X,
      entry: join(functionsPath, 'notificationService/index.ts'),
      handler: 'notificationHandler',
      environment: {
        NOTIFICATION_SECRET_NAME: secret.secretName,
        VERIFIED_SENDER:  config[stage].verifiedSender
      }
    })

    secret.grantRead(notificationsHandlerLambda)
    notificationsHandlerLambda.addEventSource( new lambdaEventSources.SqsEventSource(notificationsQueue))


    // Create orderHandlerLambda 

    const orderHandler = new nodeLambda.NodejsFunction(this, `${stage}OrderHandlerLambda`, {
      runtime: Runtime.NODEJS_14_X,
      entry: join(functionsPath, 'orderService/index.ts'),
      handler: 'orderHandler',
      environment: {
        ORDERS_TABLE: ordersTable.tableName,
        NOTIFICATIONS_TOPIC_ARN: orderCreatedTopic.topicArn
      }
    })

    // Give orderHandler the right permissions to the sns topic and the dynamodb table
    ordersTable.grantReadWriteData(orderHandler)
    orderCreatedTopic.grantPublish(orderHandler)

    // Create a LambdaRestApi rest api as point of entry to create orders

    const api = new apigateway.LambdaRestApi(this, 'myapi', {
      handler: orderHandler,
      proxy: false,
      deployOptions: {
        stageName: stage
      }
    })

    const orders = api.root.addResource('orders')

    orders.addMethod('POST')

  }
}
