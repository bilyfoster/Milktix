import { useEffect } from 'react'
import { Shield, Lock, Eye, Database, Share2, Cookie } from 'lucide-react'

export function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, 
      purchase tickets, create events, or contact us. This includes your name, email address, phone number, 
      payment information, and event details. We also automatically collect certain information about your 
      device and usage of our platform.`
    },
    {
      icon: Lock,
      title: 'How We Protect Your Data',
      content: `We implement appropriate technical and organizational measures to protect your personal 
      information against unauthorized access, alteration, disclosure, or destruction. This includes 
      SSL/TLS encryption, secure data storage, regular security audits, and access controls. We never 
      store your full credit card details on our servers.`
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: `We use your information to provide and improve our services, process transactions, 
      communicate with you, personalize your experience, and comply with legal obligations. For organizers, 
      we share attendee information necessary for event management. We do not sell your personal information 
      to third parties.`
    },
    {
      icon: Share2,
      title: 'Information Sharing',
      content: `We may share your information with: (1) Event organizers when you purchase tickets to 
      their events, (2) Service providers who perform services on our behalf, (3) Legal authorities 
      when required by law, and (4) Business partners with your consent. All third parties are bound 
      by confidentiality obligations.`
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking',
      content: `We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
      and deliver personalized content. You can control cookies through your browser settings. Disabling 
      cookies may limit some functionality of our platform.`
    },
    {
      icon: Shield,
      title: 'Your Rights and Choices',
      content: `You have the right to access, correct, or delete your personal information. You can 
      update your account settings at any time or contact us for assistance. You may also opt out of 
      marketing communications while still receiving transactional messages about your orders.`
    }
  ]

  return (
    <div className="min-h-screen bg-warmgray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-warmgray-900 mb-4">Privacy Policy</h1>
          <p className="text-warmgray-600">Last updated: March 5, 2026</p>
        </div>

        {/* Introduction */}
        <div className="card p-8 mb-8">
          <p className="text-warmgray-600 leading-relaxed">
            At MilkTix, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our platform. By using MilkTix, you 
            consent to the practices described in this policy.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-5 w-5 text-coral-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-warmgray-900 mb-3">{section.title}</h2>
                  <p className="text-warmgray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Retention */}
        <div className="card p-8 mt-6">
          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Data Retention</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            We retain your personal information for as long as necessary to provide our services, 
            comply with legal obligations, resolve disputes, and enforce our agreements. When we no 
            longer need your information, we securely delete or anonymize it. Event-related data may 
            be retained for tax and accounting purposes.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Children Privacy</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            MilkTix is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe 
            your child has provided us with personal information, please contact us immediately.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">International Transfers</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your information in accordance 
            with this Privacy Policy, regardless of where it is processed.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Changes to This Policy</h2>
          <p className="text-warmgray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date. Your continued 
            use of MilkTix after any changes indicates your acceptance of the updated policy.
          </p>
        </div>

        {/* Contact */}
        <div className="card p-8 mt-6 bg-coral-50 border-coral-200">
          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Contact Us</h2>
          <p className="text-warmgray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="mt-4 space-y-2 text-warmgray-600">
            <li>Email: <a href="mailto:privacy@milktix.com" className="text-coral-600 hover:underline">privacy@milktix.com</a></li>
            <li>Address: 123 Event Street, Suite 100, San Francisco, CA 94102</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
