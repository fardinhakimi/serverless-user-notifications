declare namespace Notifcation {

    export type EmailNotifcation = {
        orderId: string
        email: string
    }

    export type SmsNotification = {
        orderId: string
        phoneNumber: number
    }

    type SecretShape = {
        SEND_GRID_API_KEY?: string
    }

    export type UserNotification = SmsNotification | EmailNotifcation
}