import { useEffect } from 'react'
import { FileText, Scale, Shield, AlertCircle } from 'lucide-react'

export function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: `By accessing or using MilkTix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting.`
    },
    {
      icon: Scale,
      title: 'Use of Service',
      content: `MilkTix provides an online platform for event creation, ticketing, and management. You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account and password.`
    },
    {
      icon: Shield,
      title: 'Event Organizer Responsibilities',
      content: `As an event organizer, you are solely responsible for your events, including content, ticketing, refunds, and attendee communication. You represent that you have the right to organize the event and sell tickets. MilkTix is not responsible for event cancellations, changes, or disputes between organizers and attendees.`
    },
    {
      icon: AlertCircle,
      title: 'Fees and Payments',
      content: `MilkTix charges a platform fee of 2.5% + $0.30 per ticket sold. Payment processing fees (typically 2.9% + $0.30) are charged by our payment processor. All fees are deducted from ticket sales before payout to organizers. Payouts are made to your connected bank account within 2 business days.`
    }
  ]

  return (
    <div className="min-h-screen bg-warmgray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-warmgray-900 mb-4">Terms of Service</h1>
          <p className="text-warmgray-600">Last updated: March 5, 2026</p>
        </div>

        {/* Introduction */}
        <div className="card p-8 mb-8">
          <p className="text-warmgray-600 leading-relaxed">
            Welcome to MilkTix. These Terms of Service govern your use of our website, mobile applications, 
            and services. Please read these terms carefully before using our platform. By using MilkTix, 
            you agree to these terms and our Privacy Policy.
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

        {/* Additional Sections */}
        <div className="card p-8 mt-6">
          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Refund Policy</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            Refund policies are set by individual event organizers. MilkTix facilitates refunds but the decision 
            to issue refunds is at the discretion of the event organizer, subject to their stated refund policy. 
            Service fees are generally non-refundable unless the event is cancelled.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Intellectual Property</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            MilkTix and its original content, features, and functionality are owned by MilkTix Inc. and are 
            protected by international copyright, trademark, patent, trade secret, and other intellectual property 
            laws. You retain ownership of content you upload but grant us a license to use it to provide our services.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Limitation of Liability</h2>
          <p className="text-warmgray-600 leading-relaxed mb-6">
            MilkTix shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages, including without limitation, loss of profits, data, use, goodwill, or other intangible 
            losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <h2 className="text-xl font-semibold text-warmgray-900 mb-4">Governing Law</h2>
          <p className="text-warmgray-600 leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of the State of 
            California, United States, without regard to its conflict of law provisions. Any legal action 
            shall be brought in the courts located in San Francisco, California.
          </p>
        </div>

        {/* Contact */}
        <div className="text-center mt-8 text-warmgray-600">
          <p>Questions about these terms? Contact us at <a href="mailto:legal@milktix.com" className="text-coral-600 hover:underline">legal@milktix.com</a></p>
        </div>
      </div>
    </div>
  )
}
