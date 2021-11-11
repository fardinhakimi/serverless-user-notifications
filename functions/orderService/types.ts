declare namespace OrderService {

    export type EmailNotifcation = {
        orderId: string
        email: string
    }

    export type OrderInput = {
        customer: {
            customerId: string
            email: string
        }
        item: string 
    }
}