import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email Address",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        })

        console.log("Email sent successfully: ", response);
        
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        throw new Error(`Error sending email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}];

    try {
        
       const response =  await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "882a671f-bcd5-4d64-98d6-b558d3b62aa6",
            template_variables: {
                "company_info_name" : "Auth",
                "name": name,
            }
        });

        console.log("Welcome email sent successfully: ", response);
    } catch (error) {
        console.error(`Error sending welcome email: ${error}`);

        throw new Error(`Error sending welcome email: ${error}`);
    }
}