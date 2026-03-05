import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuthStore } from '../stores/authStore'

interface CmsPageData {
  slug: string
  title: string
  content: string
  metaDescription?: string
  fallback?: boolean
}

export function Contact() {
  const [cmsPage, setCmsPage] = useState<CmsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchCmsPage()
  }, [])

  const fetchCmsPage = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cms/pages/contact')
      setCmsPage(response.data)
    } catch (err) {
      console.error('Failed to fetch CMS page:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to an API
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@milktix.com',
      description: 'We will respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 9am to 6pm EST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Event Street, Suite 100',
      description: 'San Francisco, CA 94102'
    }
  ]

  const faqs = [
    {
      q: 'How do I create an event?',
      a: 'Sign up for an organizer account, then click "Create Event" from your dashboard. Our step-by-step wizard will guide you through the process.'
    },
    {
      q: 'What fees do you charge?',
      a: 'We charge a small platform fee of 2.5% + $0.30 per ticket. There are no monthly fees or setup costs.'
    },
    {
      q: 'How do I get paid?',
      a: 'Connect your Stripe account and receive payouts directly to your bank account within 2 business days of each sale.'
    },
    {
      q: 'Can I offer refunds?',
      a: 'Yes, you can issue full or partial refunds directly from your organizer dashboard at any time.'
    }
  ]

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  // If CMS content exists and is not fallback, render it with contact form
  if (cmsPage && !cmsPage.fallback) {
    return (
      <div className="min-h-screen bg-warmgray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-warmgray-900">{cmsPage.title}</h1>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/content"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral-600 bg-coral-50 rounded-lg hover:bg-coral-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit in Admin
                </Link>
              )}
            </div>
            <div 
              className="prose prose-warmgray max-w-none"
              dangerouslySetInnerHTML={{ __html: cmsPage.content }}
            />
          </div>

          {/* Contact Form Section */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-coral-600" />
              <h2 className="text-2xl font-bold text-warmgray-900">Send us a Message</h2>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Message Sent!</h3>
                <p className="text-green-700">Thank you for reaching out. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Subject</label>
                  <select
                    required
                    className="input"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select a subject...</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="input resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you?"
                  />
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback: render hardcoded content
  return (
    <div className="min-h-screen bg-warmgray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Edit Button - only for fallback content */}
        {user?.role === 'ADMIN' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-yellow-800">
                This page is using default content.
              </p>
              <Link
                to="/admin/content"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral-600 bg-white rounded-lg hover:bg-coral-50 transition-colors border border-coral-200"
              >
                <Edit className="h-4 w-4" />
                Edit in Admin
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-warmgray-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-warmgray-600 max-w-2xl mx-auto">
            Have a question or need help? We are here to support you. Reach out to our team 
            and we will get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div key={index} className="card p-6 text-center">
              <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <info.icon className="h-6 w-6 text-coral-600" />
              </div>
              <h3 className="text-lg font-semibold text-warmgray-900 mb-1">{info.title}</h3>
              <p className="text-coral-600 font-medium mb-1">{info.content}</p>
              <p className="text-warmgray-500 text-sm">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-coral-600" />
              <h2 className="text-2xl font-bold text-warmgray-900">Send us a Message</h2>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Message Sent!</h3>
                <p className="text-green-700">Thank you for reaching out. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Subject</label>
                  <select
                    required
                    className="input"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select a subject...</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="input resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you?"
                  />
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-warmgray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-warmgray-200 pb-4 last:border-0">
                  <h3 className="font-semibold text-warmgray-900 mb-2">{faq.q}</h3>
                  <p className="text-warmgray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
