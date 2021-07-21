import Mailgun from 'mailgun.js'
import formData from 'form-data'
const mailgun = new Mailgun(formData);

const key = process.env.MG_KEY || ''
const domain = process.env.MG_DOMAIN

export interface Sender {
    sendEmail: (to: string, subject: string, text: string) => void
}
const sendEmail = (to: string, subject: string, text: string) => {
    const mg = mailgun.client({ username: 'api', key });
    const data = { from: `"map-nn" <no-reply@${domain}>`, to, subject, text };
    mg.messages.create(domain, data).catch((error: any) => {
        console.log(`mail sent to ${to}${error ? ', error ' + error : ''}`)
    });
}
export default { sendEmail }