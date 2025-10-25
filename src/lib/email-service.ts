import { supabase } from './supabase';

export interface EmailOptions {
  to: string | string[];
  from?: string;
  fromName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
  metadata?: Record<string, any>;
  scheduledAt?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        throw new Error('User must be authenticated to send emails');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send email',
          details: data.details,
        };
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: 'Bienvenue sur Timepulse',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Timepulse !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Nous sommes ravis de vous accueillir sur <strong>Timepulse</strong>, votre plateforme de chronométrage et d'inscription pour événements sportifs.</p>
              <p>Avec Timepulse, vous pouvez :</p>
              <ul>
                <li>Découvrir et vous inscrire à des événements sportifs</li>
                <li>Gérer vos inscriptions en ligne</li>
                <li>Accéder à vos résultats en temps réel</li>
                <li>Participer au co-voiturage et à l'échange de dossards</li>
              </ul>
              <p style="text-align: center;">
                <a href="${import.meta.env.VITE_SUPABASE_URL?.replace('//', '//').split('/')[0] + '//' + import.meta.env.VITE_SUPABASE_URL?.replace('//', '//').split('/')[2]}" class="button">Découvrir les événements</a>
              </p>
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              <p>Sportivement,<br>L'équipe Timepulse</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Timepulse - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bonjour ${name},\n\nNous sommes ravis de vous accueillir sur Timepulse, votre plateforme de chronométrage et d'inscription pour événements sportifs.\n\nSportivement,\nL'équipe Timepulse`,
    });
  }

  async sendRegistrationConfirmation(
    email: string,
    name: string,
    eventName: string,
    raceName: string,
    bibNumber?: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: `Confirmation d'inscription - ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Inscription confirmée !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Votre inscription a été confirmée avec succès.</p>

              <div class="info-box">
                <div class="info-row">
                  <span class="label">Événement :</span>
                  <span class="value">${eventName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Épreuve :</span>
                  <span class="value">${raceName}</span>
                </div>
                ${bibNumber ? `
                <div class="info-row">
                  <span class="label">Dossard :</span>
                  <span class="value">${bibNumber}</span>
                </div>
                ` : ''}
              </div>

              <p>Nous vous souhaitons une excellente préparation et un très bon événement !</p>

              <p>Sportivement,<br>L'équipe Timepulse</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Timepulse - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bonjour ${name},\n\nVotre inscription a été confirmée avec succès.\n\nÉvénement : ${eventName}\nÉpreuve : ${raceName}${bibNumber ? `\nDossard : ${bibNumber}` : ''}\n\nNous vous souhaitons une excellente préparation et un très bon événement !\n\nSportivement,\nL'équipe Timepulse`,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Timepulse',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation du mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe sur Timepulse.</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </p>
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </div>
              <p>Cordialement,<br>L'équipe Timepulse</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Timepulse - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe sur Timepulse.\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n${resetLink}\n\nCe lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nCordialement,\nL'équipe Timepulse`,
    });
  }

  async sendCarpoolingNotification(
    email: string,
    name: string,
    eventName: string,
    driverName: string,
    departureCity: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: `Nouvelle demande de co-voiturage - ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .info-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Nouvelle demande de co-voiturage</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p><strong>${driverName}</strong> a réservé une place dans votre offre de co-voiturage pour l'événement <strong>${eventName}</strong>.</p>

              <div class="info-box">
                <p><strong>📍 Départ :</strong> ${departureCity}</p>
                <p><strong>👤 Passager :</strong> ${driverName}</p>
              </div>

              <p>Connectez-vous à votre espace pour gérer vos offres de co-voiturage et contacter votre passager.</p>

              <p>Bon trajet !<br>L'équipe Timepulse</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Timepulse - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bonjour ${name},\n\n${driverName} a réservé une place dans votre offre de co-voiturage pour l'événement ${eventName}.\n\nDépart : ${departureCity}\nPassager : ${driverName}\n\nConnectez-vous à votre espace pour gérer vos offres de co-voiturage.\n\nBon trajet !\nL'équipe Timepulse`,
    });
  }
}

export const emailService = EmailService.getInstance();
