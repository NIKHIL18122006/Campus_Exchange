import { sendMail } from './services/mailer.service.js';

await sendMail('nikhil.cs24@bmsce.ac.in', '123456');
console.log('Sent!');