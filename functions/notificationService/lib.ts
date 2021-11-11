import * as sgMail from '@sendgrid/mail'
import * as AWS from 'aws-sdk'
import * as EmailValidator from 'email-validator'
import { isEmailNotification, isSmsNotification } from './guards'


const secretManager = new AWS.SecretsManager()

const getSecrets = async (): Promise<Notifcation.SecretShape | undefined> => {

    try {

        const secretName = process.env.NOTIFICATION_SECRET_NAME

        if(!secretName) throw new Error('NOTIFICATION_SECRET_NAME env must be defined')

        const secretValue =  await secretManager.getSecretValue({ SecretId: secretName}).promise()

        if(!secretValue) throw new Error('Failed to get Secret Value')

        if('SecretString' in secretValue) return JSON.parse(secretValue.SecretString!)
        
    } catch (error) {
        console.error(error)
    }

    return 
}


export const sendNotification = async (notification: Notifcation.UserNotification) => {

    console.log(' Received notification ', notification)

    if(isEmailNotification(notification)) return sendEmail(notification)
    
    if(isSmsNotification(notification)) return sendSms(notification)

    throw new Error('Unsupported type of notification')
}


const sendEmail = async ({ email, orderId}: Notifcation.EmailNotifcation) => {

    console.log('Sending email notification')

    const verifiedSender = process.env.VERIFIED_SENDER

    if(!verifiedSender) throw new Error('VERIFIED_SENDER env var must be set')

    if(!EmailValidator.validate(email)) throw new Error(`${email} is not a valid email address`)

    const secrets = await getSecrets()
    
    sgMail.setApiKey(secrets?.SEND_GRID_API_KEY!)

    console.log('Sending order confirmation')

    return sgMail.send({
        to: email,
        from: verifiedSender, 
        subject: `Order confirmation ${orderId}`,
        text: `Your order is confirmed!.`,
        html: `<h3> Your order is confirmed.</h3>`,
    })
}

const sendSms = async (notification: Notifcation.SmsNotification) => {
    throw new Error('Sending sms is not supported yet.')
}