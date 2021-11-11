import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createOrUpdateOrder, notifyUser, createErrorResponse } from './lib'

export const orderHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {

        if(event.httpMethod !== 'POST') throw new Error('Unsupported operation encountered')

        const orderInput = JSON.parse(event.body || '') as OrderService.OrderInput

        if(!orderInput?.item || !orderInput?.customer) throw new Error('item and customer info is required to make an order')

        const orderId = await createOrUpdateOrder(orderInput)
        
        await notifyUser({ email: orderInput.customer.email, orderId})
      
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