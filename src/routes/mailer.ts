import Mailgun from 'mailgun.js'
import formData from 'form-data'
const mailgun = new Mailgun(formData);

const key = process.env.MG_KEY || ''
const domain = process.env.MG_DOMAIN
export interface Sender {
    sendEmail: (to: string, subject: string, text: string) => Promise<unknown>
}
const sendEmail = async (to: string, subject: string, text: string) => {
    const mg = mailgun.client({ username: 'api', key });
    const data = { from: `"map-nn" <no-reply@${domain}>`, to, subject, html: text };
    try {
        await mg.messages.create(domain, data, true)
    } catch(error) {
        console.log(`mail sent to ${to}${error ? ', error ' + error : ''}`)
        throw error
    }
}
export default { sendEmail }