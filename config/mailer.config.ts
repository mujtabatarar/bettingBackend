// src/config/mailer.config.ts
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';

dotenv.config();

export const mailerConfig: MailerOptions = {
    transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    },
    defaults: {
        from: process.env.FROM_EMAIL,
    },
    template: {
        dir: __dirname + '/../templates',
        adapter: new HandlebarsAdapter(), // or new PugAdapter(), or new EjsAdapter()
        options: {
            strict: true,
        },
    },
};
