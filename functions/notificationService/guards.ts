export const isEmailNotification = (notification: Notifcation.UserNotification): notification is Notifcation.EmailNotifcation => {
    return (notification as Notifcation.EmailNotifcation).email !== undefined
}


export const isSmsNotification = (notification: Notifcation.UserNotification): notification is Notifcation.SmsNotification => {
    return (notification as Notifcation.SmsNotification).phoneNumber !== undefined
}