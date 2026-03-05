-- Email settings and templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email log for tracking
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    template_name VARCHAR(100),
    subject VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- SENT, FAILED, PENDING
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform email settings
CREATE TABLE email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    smtp_password TEXT, -- encrypted
    from_email VARCHAR(255) DEFAULT 'noreply@milktix.com',
    from_name VARCHAR(255) DEFAULT 'MilkTix',
    use_tls BOOLEAN DEFAULT true,
    enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, content, description) VALUES
('welcome_user', 'Welcome to MilkTix!', 
'<h2>Welcome to MilkTix, {{firstName}}!</h2>
<p>Thank you for joining MilkTix. We are excited to help you discover and create amazing events.</p>
<p><a href="{{loginUrl}}" style="background:#ff6b6b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Login to Your Account</a></p>
<p>Questions? Reply to this email or contact us at support@milktix.com</p>',
'Sent when a new user registers'),

('ticket_confirmation', 'Your Tickets for {{eventTitle}}', 
'<h2>Your Tickets are Confirmed!</h2>
<p>Hi {{firstName}},</p>
<p>Thank you for purchasing tickets to <strong>{{eventTitle}}</strong>.</p>
<h3>Event Details:</h3>
<ul>
<li><strong>Date:</strong> {{eventDate}}</li>
<li><strong>Time:</strong> {{eventTime}}</li>
<li><strong>Location:</strong> {{eventLocation}}</li>
</ul>
<h3>Your Tickets:</h3>
<p>{{ticketDetails}}</p>
<p><strong>Order Total:</strong> {{orderTotal}}</p>
<p>Show your QR code at the entrance:</p>
<p><img src="{{qrCodeUrl}}" alt="Ticket QR Code" style="max-width:200px;"/></p>
<p>See you at the event!</p>',
'Sent after successful ticket purchase'),

('event_reminder_24h', 'Reminder: {{eventTitle}} is Tomorrow!', 
'<h2>Event Reminder</h2>
<p>Hi {{firstName}},</p>
<p>Just a friendly reminder that <strong>{{eventTitle}}</strong> is tomorrow!</p>
<h3>When:</h3>
<p>{{eventDate}} at {{eventTime}}</p>
<h3>Where:</h3>
<p>{{eventLocation}}</p>
<p>Your tickets: <a href="{{ticketsUrl}}">View Tickets</a></p>',
'Sent 24 hours before event'),

('event_reminder_1h', '{{eventTitle}} Starts in 1 Hour!', 
'<h2>Starting Soon!</h2>
<p>Hi {{firstName}},</p>
<p><strong>{{eventTitle}}</strong> starts in just 1 hour!</p>
<h3>Quick Details:</h3>
<p>{{eventTime}} at {{eventLocation}}</p>
<p>Have your QR code ready for check-in.</p>',
'Sent 1 hour before event'),

('new_sale_notification', 'New Ticket Sale for {{eventTitle}}', 
'<h2>New Sale!</h2>
<p>Hi {{organizerName}},</p>
<p>You just sold {{ticketCount}} ticket(s) for <strong>{{eventTitle}}</strong>!</p>
<h3>Sale Details:</h3>
<ul>
<li><strong>Buyer:</strong> {{buyerName}} ({{buyerEmail}})</li>
<li><strong>Ticket Type:</strong> {{ticketType}}</li>
<li><strong>Amount:</strong> {{saleAmount}}</li>
<li><strong>Order ID:</strong> {{orderId}}</li>
</ul>
<p><a href="{{orderUrl}}">View Order Details</a></p>',
'Sent to organizer when ticket is sold'),

('password_reset', 'Reset Your MilkTix Password', 
'<h2>Password Reset Request</h2>
<p>Hi {{firstName}},</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<p><a href="{{resetUrl}}" style="background:#ff6b6b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Reset Password</a></p>
<p>Or copy and paste this link:</p>
<p>{{resetUrl}}</p>
<p>This link will expire in 1 hour.</p>
<p>If you did not request this, please ignore this email.</p>',
'Password reset email'),

('organizer_approved', 'Your Organizer Request is Approved!', 
'<h2>Congratulations!</h2>
<p>Hi {{firstName}},</p>
<p>Your request to become an event organizer has been <strong>approved</strong>!</p>
<p>You can now create events, sell tickets, and manage your own event dashboard.</p>
<p><a href="{{dashboardUrl}}" style="background:#ff6b6b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Go to Dashboard</a></p>
<p>We are excited to see what events you create!</p>',
'Sent when organizer request is approved');

-- Insert default email settings
INSERT INTO email_settings (from_email, from_name, enabled) 
VALUES ('noreply@milktix.com', 'MilkTix', false);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
