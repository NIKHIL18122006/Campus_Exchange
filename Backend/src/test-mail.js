import { sendMail } from './services/mailer.service.js';

await sendMail('nikhi2866@gmail.com', '123456');
console.log('Sent!');