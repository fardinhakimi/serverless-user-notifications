import { SQSEvent, Context } from 'aws-lambda'

// 
export const notificationHandler = async (event: SQSEvent, context: Context) => {

    try {

        event.Records.forEach( record => {
            console.log('Record => ', record)
            console.log('Sending message ....')
        })
        
    } catch (error) {
        console.error(error)
    }
}