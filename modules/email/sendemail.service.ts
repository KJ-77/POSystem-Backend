import { SESV2 } from 'aws-sdk';

const ses = new SESV2();

interface SendEmailParams {
    FromEmailAddress: string;
    Destination: {
        ToAddresses: string[];
    };
    Content: {
        Template: {
            TemplateName: string;
            TemplateData: string;
        };
    };
    ReplyToAddresses: string[];
}

export const sendEmail = async (params: SendEmailParams): Promise<SESV2.SendEmailResponse> => {
    try {
        const result = await ses.sendEmail(params).promise();
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};
