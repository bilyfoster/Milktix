-- CMS Pages table for editable content
CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,     -- e.g., 'about', 'contact', 'terms'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,                  -- HTML or Markdown content
    meta_description TEXT,                  -- For SEO
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pages
INSERT INTO cms_pages (slug, title, content, meta_description) VALUES
('about', 'About MilkTix', 
'<h2>Our Mission</h2>
<p>We believe that bringing people together through events is powerful. Our mission is to empower organizers with the tools they need to create exceptional experiences.</p>

<h2>What We Do</h2>
<p>MilkTix provides an all-in-one platform for event creation, ticketing, and management. From small workshops to large conferences, we make it simple.</p>

<h2>Our Values</h2>
<ul>
<li><strong>Simplicity:</strong> Easy to use for both organizers and attendees</li>
<li><strong>Reliability:</strong> Your events are always online and secure</li>
<li><strong>Transparency:</strong> Fair pricing with no hidden fees</li>
<li><strong>Community:</strong> Supporting local events and communities</li>
</ul>', 
'Learn about MilkTix - the event management platform for creators.'),

('contact', 'Contact Us',
'<h2>Get in Touch</h2>
<p>We would love to hear from you! Reach out through any of the channels below.</p>

<h3>Email</h3>
<p>support@milktix.com</p>

<h3>Phone</h3>
<p>+1 (555) 123-4567</p>
<p>Monday - Friday, 9am - 6pm EST</p>

<h3>Office</h3>
<p>123 Event Street, Suite 100<br>San Francisco, CA 94102</p>',
'Contact MilkTix support. We are here to help with your events.'),

('terms', 'Terms of Service',
'<h2>Terms of Service</h2>
<p>By using MilkTix, you agree to these terms. Please read them carefully.</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing or using MilkTix, you agree to be bound by these Terms of Service.</p>

<h3>2. Use of Service</h3>
<p>MilkTix provides an online platform for event creation, ticketing, and management.</p>

<h3>3. Fees</h3>
<p>We charge a platform fee of 2.5% + $0.30 per ticket. Payment processing fees are separate.</p>

<h3>4. Refunds</h3>
<p>Refund policies are set by individual event organizers.</p>',
'MilkTix Terms of Service - Read our terms and conditions.'),

('privacy', 'Privacy Policy',
'<h2>Privacy Policy</h2>
<p>We take your privacy seriously. This policy explains how we handle your data.</p>

<h3>Information We Collect</h3>
<p>We collect information you provide when creating events, purchasing tickets, or contacting us.</p>

<h3>How We Use Your Information</h3>
<p>We use your information to provide our services, process transactions, and communicate with you.</p>

<h3>Data Security</h3>
<p>We implement appropriate technical measures to protect your personal information.</p>',
'MilkTix Privacy Policy - Learn how we protect your data.');

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_published ON cms_pages(is_published);
