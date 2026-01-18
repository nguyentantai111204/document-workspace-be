import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { Transporter } from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name)
    private transporter: Transporter

    constructor(private readonly config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get('MAIL_HOST'),
            port: this.config.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
                user: this.config.get('MAIL_USER'),
                pass: this.config.get('MAIL_PASSWORD'),
            },
        })
    }

    private renderTemplate(
        templateName: string,
        data: Record<string, any>,
    ): string {
        const templatePath = path.join(
            process.cwd(),
            'src/common/services/mail/templates',
            `${templateName}.hbs`,
        )

        const source = fs.readFileSync(templatePath, 'utf8')
        const template = Handlebars.compile(source)

        return template(data)
    }

    async sendTemplateMail(options: {
        to: string
        subject: string
        template: string
        context: Record<string, any>
    }) {
        const html = this.renderTemplate(
            options.template,
            options.context,
        )

        try {
            await this.transporter.sendMail({
                from: `"Workspace" <${this.config.get('MAIL_FROM')}>`,
                to: options.to,
                subject: options.subject,
                html,
            })
        } catch (error) {
            this.logger.error('Send mail failed', error)
        }
    }
}
