import nodemailer from 'nodemailer';
import { logDate } from './logDate';
import { loadCredentials } from './loadCredentials';

export const MAIL_CREDENTIALS_PATH = '/home/rkrawczyszyn/credentials/mailCredentials.json';

interface Props {
  subject: string;
  text: string;
}

export const sendEmail = async ({ subject, text }: Props) => {
  // export const sendEmail = async (coinCode: string, currentValue: number) => {
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
      subject,
      text,
      // subject: `Price Alert: ${coinCode}`,
      // text: `The price of ${coinCode} has reached ${currentValue}.`,
    };

    await transporter.sendMail(message);
    console.log(`${logDate()}: Email sent to rkrawczyszyn@gmail.com`);
  } catch (error) {
    console.error(`${logDate()}: Failed to send email:`, error);
  }
};
