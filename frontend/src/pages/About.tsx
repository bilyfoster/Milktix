import { useEffect } from 'react'
import { Calendar, Users, Ticket, Shield, Zap, Heart } from 'lucide-react'

export function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const stats = [
    { label: 'Events Hosted', value: '1,000+' },
    { label: 'Happy Attendees', value: '50,000+' },
    { label: 'Organizers', value: '200+' },
    { label: 'Cities', value: '25+' },
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Easy Event Creation',
      description: 'Create and publish events in minutes with our intuitive event builder. Set up tickets, schedules, and venues effortlessly.'
    },
    {
      icon: Ticket,
      title: 'Powerful Ticketing',
      description: 'Multiple ticket types, early bird pricing, promo codes, and secure payment processing with Stripe.'
    },
    {
      icon: Users,
      title: 'Attendee Management',
      description: 'Track registrations, manage check-ins with QR codes, and communicate with attendees all in one place.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security, SSL encryption, and 99.9% uptime guarantee for your peace of mind.'
    },
    {
      icon: Zap,
      title: 'Real-time Analytics',
      description: 'Track sales, monitor attendance, and gain insights with comprehensive event analytics and reports.'
    },
    {
      icon: Heart,
      title: 'Dedicated Support',
      description: 'Our friendly support team is here to help you succeed, with resources and guidance every step of the way.'
    }
  ]

  const team = [
    { name: 'Alex Morgan', role: 'Founder & CEO', image: '👋' },
    { name: 'Sam Chen', role: 'Head of Engineering', image: '⚡' },
    { name: 'Jordan Smith', role: 'Customer Success', image: '🎯' },
    { name: 'Taylor Reed', role: 'Marketing Director', image: '🚀' },
  ]

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-coral-500 via-coral-600 to-coral-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Event Creators
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            MilkTix is the all-in-one platform that makes creating, managing, and growing events simple and stress-free.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-coral-600">{stat.value}</div>
                <div className="text-warmgray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-warmgray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-warmgray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-warmgray-600 leading-relaxed">
            We believe that bringing people together through events is powerful. Whether it is a small workshop, 
            a concert, a conference, or a community gathering, every event has the potential to create meaningful 
            connections and lasting memories. Our mission is to empower organizers with the tools they need to 
            create exceptional experiences, without the technical headaches.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-warmgray-900 text-center mb-12">Why Choose MilkTix?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6">
                <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-coral-600" />
                </div>
                <h3 className="text-xl font-semibold text-warmgray-900 mb-2">{feature.title}</h3>
                <p className="text-warmgray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-warmgray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-warmgray-900 text-center mb-12">Meet the Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.image}
                </div>
                <h3 className="text-lg font-semibold text-warmgray-900">{member.name}</h3>
                <p className="text-warmgray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-coral-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your First Event?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of organizers who trust MilkTix for their events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary bg-white text-coral-600 hover:bg-gray-100">
              Get Started Free
            </a>
            <a href="/events" className="px-6 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-colors">
              Explore Events
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
