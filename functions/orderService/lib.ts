import * as AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

export const createErrorResponse = (body = 'Something went wrong', statusCode = 500) => {
    return {
        statusCode,
        body
    }
}

export const notifyUser = async (emailNotification: OrderService.EmailNotifcation) => {

    console.log('Notifying user ...')

    const notificationsTopicArn = process.env.NOTIFICATIONS_TOPIC_ARN

    if(!notificationsTopicArn) throw new Error('NOTIFICATIONS_TOPIC_ARN env var is missing')
    
    await new AWS.SNS().publish({ MessageGroupId: 'group1',  TopicArn: notificationsTopicArn, Message: JSON.stringify(
        emailNotification
    )}).promise()
}


export const getOrderById = (id: string) => {

}
export const createOrUpdateOrder = async ({ item, customer }: OrderService.OrderInput): Promise<string> => {

    const ordersTable = process.env.ORDERS_TABLE

    if(!ordersTable) throw new Error('ORDERS_TABLE env var is missing')

    const dynamoDb = new AWS.DynamoDB.DocumentClient()

    console.log('Saving or updating the order ...')
    console.log(item)

    const id = uuidv4()

    await dynamoDb.put({
        TableName: ordersTable,
        Item: {
            id,
            item,
            customerId: customer.customerId
        }
    }).promise()

    const order = await dynamoDb.get({
        TableName: ordersTable,
        Key: { id }
    }).promise()

    return order?.Item?.id
}