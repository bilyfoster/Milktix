import { Link } from 'react-router-dom'
import { Calendar, Ticket, Shield, Zap, Users, Star } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Trusted by 10,000+ event organizers</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Sell Tickets.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Grow Your Events.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 px-4">
              The all-in-one ticketing platform for creators, venues, and event professionals. 
              Create events in minutes, sell tickets instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 px-4">
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Ticket className="h-5 w-5 mr-2" />
                Find Events
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
              >
                <Zap className="h-5 w-5 mr-2" />
                Create Event
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>2M+ Tickets Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* For Attendees Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Event Attendees
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing events, buy tickets in seconds, and enjoy seamless entry with digital tickets.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, title: 'Discover Events', desc: 'Find events near you or browse by category' },
              { icon: Ticket, title: 'Instant Tickets', desc: 'Buy tickets in seconds with Apple Pay & Google Pay' },
              { icon: Shield, title: 'Secure Payments', desc: 'Your data is protected with bank-level security' },
              { icon: Zap, title: 'Fast Entry', desc: 'Show your digital ticket and walk right in' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizers Section */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                For Event Organizers & Talent
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Everything you need to create, promote, and manage successful events. 
                From ticket sales to attendee check-in.
              </p>
              
              <div className="space-y-4">
                {[
                  'Create events in minutes with our drag-and-drop builder',
                  'Set up multiple ticket types and pricing tiers',
                  'Track sales in real-time with detailed analytics',
                  'Check in attendees with our mobile app',
                  'Get paid directly to your bank account',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to="/register"
                className="inline-flex items-center mt-8 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Start Creating Events
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8">
              <div className="bg-gray-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Total Revenue</span>
                  <span className="text-green-400 text-sm">+24% this month</span>
                </div>
                <div className="text-3xl font-bold">$24,580</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Tickets Sold</div>
                  <div className="text-xl font-bold">1,247</div>
                </div>
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Events</div>
                  <div className="text-xl font-bold">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your events?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of organizers who use MilkTix to sell tickets and grow their audience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}