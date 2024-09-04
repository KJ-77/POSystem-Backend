// controllers/emailController.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendEmail } from './sendemail.service';
import axios from 'axios';
import AWS from 'aws-sdk';

const ses = new AWS.SESV2();

export const hello = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const orderId = event.queryStringParameters?.orderId;

    if (!orderId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'orderId is required' }),
        };
    }

    try {
        // Fetch the order data from your API
        const response = await axios.get(`http://localhost:3000/getorderbyId/${orderId}`);
        const orderData = response.data;

    
        if (orderData.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Order not found' }),
            };
        }

        // Prepare the data to inject into the email template
        const testData = {
            StreetAddress: '1234 Elm Street',
            City: 'Springfield',
            State: 'IL',
            ZIP: '62701',
            PhoneNumber: '555-123-4567',
            ContactEmail: 'contact@zeroandone.com',
            Date: '2024-09-03',
            OrderNumber: 'PO123456',
            ID: orderData.ID,
            order_desc: orderData.order_desc,
            quantity: orderData.quantity,
            unit_price: orderData.unit_price,
            Total: orderData.total_price,
            TotalPrice: '150',
            reason: orderData.reason
        };

        console.log(orderData.reason)

        // Determine the template based on order status
        const templateName = orderData.order_status === 'Accepted'
            ? 'AcceptanceOrderTemplate'
            : 'RejectedOrderTemplate';

        const params = {
            FromEmailAddress: 'zaynab-wehbe@hotmail.com',
            Destination: {
                ToAddresses: ["zaynabwehbee@gmail.com"],
            },
            Content: {
                Template: {
                    TemplateName: templateName,
                    TemplateData: JSON.stringify(testData),
                },
            },
            ReplyToAddresses: ['zaynab-wehbe@hotmail.com'],
        };

        await sendEmail(params);
        return {
            statusCode: 200,
            body: JSON.stringify('Email sent successfully!'),
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify('Failed to send email.'),
        };
    }
};
