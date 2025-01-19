"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.MAIL_CREDENTIALS_PATH = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logDate_1 = require("./logDate");
const loadCredentials_1 = require("./loadCredentials");
exports.MAIL_CREDENTIALS_PATH = '/home/rkrawczyszyn/credentials/mailCredentials.json';
const sendEmail = ({ subject, text }) => __awaiter(void 0, void 0, void 0, function* () {
    // export const sendEmail = async (coinCode: string, currentValue: number) => {
    try {
        const mailCredentials = (0, loadCredentials_1.loadCredentials)(exports.MAIL_CREDENTIALS_PATH);
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(message);
        console.log(`${(0, logDate_1.logDate)()}: Email sent to rkrawczyszyn@gmail.com`);
    }
    catch (error) {
        console.error(`${(0, logDate_1.logDate)()}: Failed to send email:`, error);
    }
});
exports.sendEmail = sendEmail;
