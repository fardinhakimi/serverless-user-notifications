import { APIGatewayProxyEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'


export function createErrorResponse(body = 'Something went wrong', statusCode = 500) {
    return {
        statusCode,
        body
    }
}

export async function notifyUser() {

    console.log('Notifying user ...')

    const notificationsTopicArn = process.env.NOTIFICATIONS_TOPIC_ARN

    return new AWS.SNS().publish({ MessageGroupId: 'group1',  TopicArn: notificationsTopicArn, Message: JSON.stringify({
        email: 'send a virus to this sucker!'
    })}).promise()

}


export async function saveOrUpdateOrder(event: APIGatewayProxyEvent) {

    const ordersTable = process.env.ORDERS_TABLE

    if(!ordersTable) throw new Error('ORDERS_TABLE is missing!')

    const { id, item } = JSON.parse(event.body || '')

    if(!id || !item) throw new Error('username and item is required')

    const dynamoDb = new AWS.DynamoDB.DocumentClient()

    console.debug('Saving or updating the order ...')

    return dynamoDb.put({
        TableName: ordersTable,
        Item: {
            id,
            item
        }
    }).promise()
}