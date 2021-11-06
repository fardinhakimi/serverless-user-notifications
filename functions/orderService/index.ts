import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { saveOrUpdateOrder, notifyUser, createErrorResponse } from './lib'

export const orderHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try {

        if(event.httpMethod !== 'POST') throw new Error('Only http post is supported')

        await saveOrUpdateOrder(event)
        await notifyUser()
      
        return {
            statusCode: 201,
            body: 'Order was successfully created or updated'
        }

    } catch (error) {
        const e:Error = error as Error;
        console.error(e)
        return createErrorResponse(e.message)
    }
}