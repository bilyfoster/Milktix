-- Blog posts table for content management
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,          -- URL-friendly identifier
    title VARCHAR(300) NOT NULL,                -- Post title
    content TEXT,                               -- Main post content (HTML/Markdown)
    excerpt TEXT,                               -- Short summary for previews
    featured_image_url VARCHAR(500),            -- Hero image URL
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',         -- DRAFT, PUBLISHED, ARCHIVED
    published_at TIMESTAMP,                     -- When post was/will be published
    category VARCHAR(100),                      -- Post category
    tags TEXT[],                                -- Array of tags for filtering
    meta_description TEXT,                      -- SEO meta description
    view_count INTEGER DEFAULT 0,               -- Number of views
    featured BOOLEAN DEFAULT FALSE,             -- Featured post flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);

-- Insert sample blog posts about event planning
INSERT INTO blog_posts (slug, title, content, excerpt, status, published_at, category, tags, meta_description, view_count, featured) VALUES
('ultimate-event-planning-checklist', 'The Ultimate Event Planning Checklist for 2026',
'<h2>Introduction</h2>
<p>Planning an event can feel overwhelming, but with the right checklist, you can ensure nothing falls through the cracks. Whether you are organizing a corporate conference, a wedding, or a community fundraiser, this comprehensive guide will walk you through every step.</p>

<h2>3-6 Months Before: The Foundation</h2>
<ul>
<li><strong>Define your goals:</strong> What do you want attendees to walk away with?</li>
<li><strong>Set your budget:</strong> Include a 10-15% buffer for unexpected costs</li>
<li><strong>Choose your date:</strong> Check for competing events and holidays</li>
<li><strong>Book your venue:</strong> Popular locations fill up fast</li>
<li><strong>Secure key vendors:</strong> Caterers, photographers, AV teams</li>
</ul>

<h2>1-2 Months Before: The Details</h2>
<ul>
<li>Send invitations and open registration</li>
<li>Finalize menu and dietary accommodations</li>
<li>Plan your event schedule and speaker lineup</li>
<li>Arrange transportation and parking</li>
<li>Create signage and printed materials</li>
</ul>

<h2>1 Week Before: Final Preparations</h2>
<ul>
<li>Confirm final headcount with vendors</li>
<li>Test all technology and AV equipment</li>
<li>Prepare name badges and check-in materials</li>
<li>Brief your staff and volunteers</li>
<li>Have a weather contingency plan (for outdoor events)</li>
</ul>

<h2>Conclusion</h2>
<p>With proper planning and organization, your event is sure to be a success. Remember, the key is starting early and staying flexible when things do not go exactly as planned.</p>',
'A comprehensive checklist to help you plan successful events of any size, from corporate conferences to weddings.',
'PUBLISHED',
'2026-01-15 10:00:00',
'Planning',
ARRAY['planning', 'checklist', 'tips', 'guide'],
'Master event planning with our comprehensive 2026 checklist. From 6 months out to day-of coordination, we have got you covered.',
1250,
TRUE),

('how-to-sell-out-your-event', 'How to Sell Out Your Event: Marketing Strategies That Work',
'<h2>Know Your Audience</h2>
<p>The foundation of successful event marketing is understanding who you are trying to reach. Create detailed attendee personas that include demographics, interests, pain points, and where they spend time online.</p>

<h2>Build Anticipation Early</h2>
<p>Start your marketing push 2-3 months before ticket sales open:</p>
<ul>
<li>Tease the event on social media with countdown posts</li>
<li>Create a "notify me" landing page to capture interest</li>
<li>Partner with influencers in your niche</li>
<li>Offer early-bird pricing to create urgency</li>
</ul>

<h2>Leverage Multiple Channels</h2>
<p>Do not rely on just one marketing channel. Successful event promotion includes:</p>
<ul>
<li><strong>Email marketing:</strong> Build a nurture sequence leading up to the event</li>
<li><strong>Social media:</strong> Use platform-specific content strategies</li>
<li><strong>Paid advertising:</strong> Retarget website visitors and lookalike audiences</li>
<li><strong>Partnerships:</strong> Cross-promote with sponsors and speakers</li>
<li><strong>Content marketing:</strong> Blog posts, podcasts, and videos about event topics</li>
</ul>

<h2>Create FOMO</h2>
<p>Fear of missing out is a powerful motivator. Show social proof through:</p>
<ul>
<li>Real-time ticket sales notifications</li>
<li>Attendee testimonials from past events</li>
<li>Behind-the-scenes content</li>
<li>Limited-time offers and exclusive perks</li>
</ul>

<h2>Analyze and Optimize</h2>
<p>Track your marketing metrics and double down on what works. Use UTM parameters, promo codes, and attendee surveys to understand which channels drive the most ticket sales.</p>',
'Proven marketing strategies to boost ticket sales and create buzz around your next event.',
'PUBLISHED',
'2026-02-01 14:30:00',
'Marketing',
ARRAY['marketing', 'ticket sales', 'promotion', 'social media'],
'Discover proven strategies to sell out your events. Learn audience targeting, multi-channel marketing, and FOMO tactics that drive ticket sales.',
890,
FALSE),

('event-tech-trends-2026', '5 Event Technology Trends Transforming 2026',
'<h2>1. AI-Powered Personalization</h2>
<p>Artificial intelligence is revolutionizing how attendees experience events. From personalized session recommendations to AI chatbots that answer attendee questions 24/7, smart technology is making events more relevant and engaging for every participant.</p>

<h2>2. Hybrid Event Platforms</h2>
<p>The line between in-person and virtual events continues to blur. Modern platforms offer seamless integration of physical and digital experiences, allowing remote attendees to network, participate in Q&A, and even visit virtual exhibitor booths.</p>

<h2>3. Contactless Everything</h2>
<p>From mobile check-ins to cashless payments and digital business cards, contactless technology is now the expectation. QR codes have made a major comeback, enabling touch-free interactions throughout the event journey.</p>

<h2>4. Immersive Experiences with AR/VR</h2>
<p>Augmented and virtual reality are moving beyond gimmicks to create genuine value:</p>
<ul>
<li>Virtual venue tours for prospective attendees</li>
<li>AR wayfinding to help navigate large venues</li>
<li>Interactive product demonstrations</li>
<li>Virtual networking lounges</li>
</ul>

<h2>5. Real-Time Analytics and Engagement Tracking</h2>
<p>Event organizers now have unprecedented visibility into attendee behavior. Heat maps show which booth areas attract the most traffic, session analytics reveal engagement levels, and sentiment analysis tracks social buzz in real-time.</p>

<h2>Getting Started</h2>
<p>You do not need to implement every trend at once. Start by identifying your biggest pain points and choosing technology that directly addresses them. Remember, technology should enhance the human experience, not replace it.</p>',
'Explore the cutting-edge technologies shaping the future of events, from AI personalization to immersive AR/VR experiences.',
'PUBLISHED',
'2026-02-20 09:00:00',
'Technology',
ARRAY['technology', 'trends', 'AI', 'hybrid events', 'innovation'],
'Stay ahead of the curve with these 5 event technology trends for 2026. From AI personalization to immersive AR/VR experiences.',
650,
FALSE);
