package com.milktix.service;

import com.milktix.entity.EmailLog;
import com.milktix.entity.EmailTemplate;
import com.milktix.repository.EmailLogRepository;
import com.milktix.repository.EmailTemplateRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailTemplateRepository templateRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Value("${milktix.email.from-address:noreply@milktix.com}")
    private String fromEmail;

    @Value("${milktix.email.from-name:MilkTix}")
    private String fromName;

    @Value("${milktix.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * Check if email service is available
     */
    public boolean isEmailAvailable() {
        return emailEnabled && mailSender != null;
    }

    /**
     * Send email using template
     */
    @Async
    @Transactional
    public void sendTemplateEmail(String toEmail, String templateName, Map<String, String> variables) {
        if (!isEmailAvailable()) {
            System.out.println("Email disabled. Would send to: " + toEmail + " using template: " + templateName);
            logEmail(toEmail, templateName, "EMAIL_DISABLED", null, "Email service disabled (enable with EMAIL_ENABLED=true and configure SMTP)");
            return;
        }

        Optional<EmailTemplate> templateOpt = templateRepository.findByName(templateName);
        if (templateOpt.isEmpty() || !templateOpt.get().getIsActive()) {
            System.err.println("Email template not found or inactive: " + templateName);
            logEmail(toEmail, templateName, "TEMPLATE_NOT_FOUND", null, "Template not found: " + templateName);
            return;
        }

        EmailTemplate template = templateOpt.get();
        
        // Process template variables
        String subject = processTemplate(template.getSubject(), variables);
        String content = processTemplate(template.getContent(), variables);
        
        // Wrap content in HTML email structure
        String htmlContent = wrapInEmailTemplate(content);
        
        sendHtmlEmail(toEmail, subject, htmlContent, templateName);
    }

    /**
     * Send raw HTML email
     */
    @Async
    @Transactional
    public void sendHtmlEmail(String toEmail, String subject, String htmlContent, String templateName) {
        if (!isEmailAvailable()) {
            System.out.println("Email disabled. Would send to: " + toEmail);
            logEmail(toEmail, templateName, "EMAIL_DISABLED", null, "Email service disabled (enable with EMAIL_ENABLED=true and configure SMTP)");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            try {
                helper.setFrom(fromEmail, fromName);
            } catch (UnsupportedEncodingException e) {
                helper.setFrom(fromEmail);
            }
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            logEmail(toEmail, templateName, "SENT", subject, null);
            System.out.println("Email sent successfully to: " + toEmail);
            
        } catch (MailException e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            logEmail(toEmail, templateName, "FAILED", subject, e.getMessage());
        } catch (MessagingException e) {
            System.err.println("Email composition error: " + e.getMessage());
            logEmail(toEmail, templateName, "FAILED", subject, e.getMessage());
        }
    }

    /**
     * Send plain text email
     */
    @Async
    @Transactional
    public void sendSimpleEmail(String toEmail, String subject, String textContent) {
        sendHtmlEmail(toEmail, subject, "<pre>" + textContent + "</pre>", "plain");
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken, String baseUrl) {
        Map<String, String> variables = Map.of(
            "firstName", firstName != null ? firstName : "User",
            "resetUrl", baseUrl + "/reset-password?token=" + resetToken
        );
        sendTemplateEmail(toEmail, "password_reset", variables);
    }

    /**
     * Send welcome email
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String firstName, String loginUrl) {
        Map<String, String> variables = Map.of(
            "firstName", firstName != null ? firstName : "User",
            "loginUrl", loginUrl
        );
        sendTemplateEmail(toEmail, "welcome_user", variables);
    }

    /**
     * Send ticket confirmation email
     */
    @Async
    public void sendTicketConfirmationEmail(String toEmail, Map<String, String> variables) {
        sendTemplateEmail(toEmail, "ticket_confirmation", variables);
    }

    /**
     * Send event reminder
     */
    @Async
    public void sendEventReminder(String toEmail, String templateName, Map<String, String> variables) {
        sendTemplateEmail(toEmail, templateName, variables);
    }

    /**
     * Send new sale notification to organizer
     */
    @Async
    public void sendNewSaleNotification(String toEmail, Map<String, String> variables) {
        sendTemplateEmail(toEmail, "new_sale_notification", variables);
    }

    /**
     * Send organizer approval email
     */
    @Async
    public void sendOrganizerApprovedEmail(String toEmail, String firstName, String dashboardUrl) {
        Map<String, String> variables = Map.of(
            "firstName", firstName != null ? firstName : "User",
            "dashboardUrl", dashboardUrl
        );
        sendTemplateEmail(toEmail, "organizer_approved", variables);
    }

    /**
     * Replace template variables {{variable}} with actual values
     */
    private String processTemplate(String template, Map<String, String> variables) {
        String result = template;
        Pattern pattern = Pattern.compile("\\{\\{(\\w+)\\}\\}");
        Matcher matcher = pattern.matcher(result);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            String value = variables.getOrDefault(variable, "");
            result = result.replace("{{" + variable + "}}", value);
        }
        
        return result;
    }

    /**
     * Wrap content in standard email template
     */
    private String wrapInEmailTemplate(String content) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .header h1 { color: white; margin: 0; font-size: 24px; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
                    a { color: #ff6b6b; text-decoration: none; }
                    .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    ul { padding-left: 20px; }
                    li { margin-bottom: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>MilkTix</h1>
                    </div>
                    <div class="content">
                        """ + content + """
                    </div>
                    <div class="footer">
                        <p>© 2026 MilkTix. All rights reserved.</p>
                        <p>Questions? Contact us at <a href="mailto:support@milktix.com">support@milktix.com</a></p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    /**
     * Log email to database
     */
    @Transactional
    private void logEmail(String toEmail, String templateName, String status, String subject, String errorMessage) {
        try {
            EmailLog log = new EmailLog();
            log.setRecipientEmail(toEmail);
            log.setTemplateName(templateName);
            log.setSubject(subject);
            log.setStatus(EmailLog.EmailStatus.valueOf(status));
            log.setErrorMessage(errorMessage);
            if ("SENT".equals(status)) {
                log.setSentAt(LocalDateTime.now());
            }
            emailLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to log email: " + e.getMessage());
        }
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }
}
