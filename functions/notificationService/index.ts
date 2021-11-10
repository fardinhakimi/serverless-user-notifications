import { SQSEvent } from 'aws-lambda'
import { sendNotification } from './lib'

export const notificationHandler = async (event: SQSEvent) => {

    try {

        event.Records.forEach( record => {
            sendNotification(JSON.parse(record.body) as Notifcation.UserNotification)
            .then(() => console.log("Notification was sent successfully"))
        })
        
    } catch (error) {
        console.error(error)
    }
}