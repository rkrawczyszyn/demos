import nodemailer from 'nodemailer';
import { MAIL_CREDENTIALS_PATH } from '../binanceDetect';
import { logDate } from '../utils/logDate';
import { loadCredentials } from '../utils/loadCredentials';

export const sendEmail = async (coinCode: string, currentValue: number) => {
  try {
    const mailCredentials = loadCredentials(MAIL_CREDENTIALS_PATH);

    const transporter = nodemailer.createTransport({
      host: 'smtp.wp.pl',
      port: 465,
      secure: true,
      auth: {
        user: mailCredentials.user,
        pass: mailCredentials.pass,
      },
    });

    const message = {
      from: 'robert-kowaliszyn@wp.pl',
      to: 'rkrawczyszyn@gmail.com',
      subject: `Price Alert: ${coinCode}`,
      text: `The price of ${coinCode} has reached ${currentValue}.`,
    };

    await transporter.sendMail(message);
    console.log(`${logDate()}: Email sent to rkrawczyszyn@gmail.com`);
  } catch (error) {
    console.error(`${logDate()}: Failed to send email:`, error);
  }
};
