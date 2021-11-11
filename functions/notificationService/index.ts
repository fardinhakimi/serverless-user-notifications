import { SQSEvent } from 'aws-lambda'
import { sendNotification } from './lib'

export const notificationHandler = async (event: SQSEvent) => {

    try {

        for( const record of event.Records) {
            const messageBody = JSON.parse(record.body)
            const response = await sendNotification(JSON.parse(messageBody.Message) as Notifcation.UserNotification)
            console.log(response)
        }
        
    } catch (error) {
        console.error(error)
    }
}