import * as sgMail from '@sendgrid/mail'
import * as AWS from 'aws-sdk'


const secretManager = new AWS.SecretsManager()

const getSecrets = async (): Promise<Notifcation.SecretShape | undefined> => {

    const secretName = process.env.NOTIFICATION_SECRET_NAME


    if(!secretName) throw new Error('SECRET_NAME env must be defined to get the secret value')

    try {

        const secretValue =  await secretManager.getSecretValue({ SecretId: secretName}).promise()

        if(!secretValue) throw new Error('Failed to get Secret Value')

        if('SecretString' in secretValue) return JSON.parse(secretValue.SecretString!)

        return {

        }
        
    } catch (error) {
        console.error(error)
        return
    }
}


export const sendNotification = async (notification: Notifcation.UserNotification) => {

    if(isEmailNotification(notification)) return sendEmail(notification)
    
    if(isSmsNotification(notification)) return sendSms(notification)

    throw new Error('Unsupported type of notification')
}



function isEmailNotification(notification: Notifcation.UserNotification): notification is Notifcation.EmailNotifcation {
    return (notification as Notifcation.EmailNotifcation).userEmail !== undefined;
}


function isSmsNotification(notification: Notifcation.UserNotification): notification is Notifcation.SmsNotification {
    return (notification as Notifcation.SmsNotification).phoneNumber !== undefined;
}

const sendEmail = async (notification: Notifcation.EmailNotifcation) => {

    const secrets = await getSecrets()
    
    sgMail.setApiKey(secrets?.SEND_GRID_API_KEY!)

    console.log('Sending order confirmation')

    const msg = {
        to: notification.userEmail,
        from: 'fardinhakimi@gmail.com', 
        subject: `Order confirmation ${notification.orderId}`,
        text: `Your order is confirmed!.`,
        html: `<h3> Your order is confirmed.</h3>`,
    }

    return await sgMail.send(msg)
}

const sendSms = async (notification: Notifcation.SmsNotification) => {
    throw new Error('sending sms is not supported yet.')
}
