//No worries about added info, not missed. 
import AWS from 'aws-sdk';
import { error } from 'console';
const ses = new AWS.SESV2();

const htmlTemplate = `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        h2{
            color:#005858;
            margin-left: 7px;
        }
        .purchase-order {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
        }
        .purchase-order h1 {
            text-align: center;
            font-size: 34px;
            margin-bottom: 20px;
            color: #005858;
        }
        .purchase-order .company-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .span{
            font-weight: bolder;
            color:#005858;
        }
        .purchase-order table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .purchase-order table, .purchase-order th, .purchase-order td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .purchase-order th {
            color: white;
            background-color: #005858;
        }
        .purchase-order .totals {
            text-align: right;
        }
        .purchase-order .totals span {
            display: inline-block;
            width: 150px;
        }
    </style>
</head>
<body>
    <div class="purchase-order">
        <h1>PURCHASE ORDER</h1>
        <div class="company-info">
            <div>  
                <h2><strong>Zero&One</strong></h2>
                <p><span class="span">Email: </span>{{ContactEmail}}</p>
            </div>  
            <div>
                <p><span class="span">Date:</span> {{Date}}</p>
                <p><span class="span">PO #:</span> {{OrderNumber}}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ITEM NAME</th>
                    <th>DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{order_name}}</td>
                    <td>{{order_desc}}</td>
                    <td>{{quantity}}</td>
                    <td>{{unit_price}}</td>
                    <td>{{Total}}</td>
                </tr>
            </tbody>
        </table>
        <div class="totals">

            <p><span class="span">TOTAL:</span> {{TotalPrice}}</p>
        </div>
        <p><strong>if you have any questions about this purchase order, please contact us.</strong> </p>
    </div>
</body>
`;
const htmlTemplate2 =`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Rejection Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #d9534f;
            font-size: 24px;
            margin: 0;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
        }
        .content p {
            margin-bottom: 20px;
        }
        .reason {
            font-weight: bold;
            color: #d9534f;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Order Has Been Rejected</h1>
        </div>
        <div class="content">
            <p>Dear Customer,</p>
            <p>We regret to inform you that your recent order <strong>Order: {{order_name}}</strong> has been rejected.</p>
            <p>The reason for rejection is as follows:</p>
            <p class="reason">{{reason}}</p>
            <p>If you have any questions or need further assistance, please feel free to contact our support team.</p>
            <p>Thank you for your understanding.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>Zero&One</p>
        </div>
    </div>
</body>
</html>

`;

export const handler = async (event: any) => {
    const templateName = 'AcceptanceOrderTemplateFinal2';

    /// Define parameters for creating the template
    const createParams: AWS.SESV2.CreateEmailTemplateRequest = {
        TemplateName: templateName,
        TemplateContent: {
            Html: htmlTemplate,
            Subject: 'Your Purchase Order',
            Text: '',
        },
    }; 
 /*  // Define parameters for deleting the template
    const deleteParams: AWS.SESV2.DeleteEmailTemplateRequest = {
        TemplateName: templateName,
    };


    try {
        // Attempt to delete the existing template
        await ses.deleteEmailTemplate(deleteParams).promise();
        console.log("Template deleted successfully");
    } catch (deleteErr) {
        if ('NotFoundException') {
            console.log("Template does not exist, proceeding to creation");
        } else {
            console.error("Error deleting template:", deleteErr);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Failed to delete template',
                }),
            };
        }
    }*/

    try {
        // Create the new template
        const data = await ses.createEmailTemplate(createParams).promise();
        console.log("Template Created", data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Template created successfully',
                data: data,
            }),
        };
    } catch (createErr) {
        console.error("Error creating template:", createErr);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to create template',
            }),
        };
    } 
};