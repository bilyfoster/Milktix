import { Link } from 'react-router-dom'
import { Calendar, Ticket, Shield, Zap, Users, Star, ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-coral-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative container-custom py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Your Community's Ticketing Platform</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-display-sm sm:text-display-md md:text-display-lg font-bold text-white mb-6 leading-tight animate-fade-in animation-delay-100">
              Create Events.
              <br />
              <span className="text-yellow-300">Sell Tickets.</span>
              <br />
              Grow Your Community.
            </h1>
            
            {/* Subheadline */}
            <p className="text-body-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-fade-in animation-delay-200">
              The modern ticketing platform for creators, venues, and event professionals. 
              From intimate gatherings to massive festivals.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-300">
              <Link to="/events" className="btn-white text-base px-8 py-4">
                <Ticket className="h-5 w-5 mr-2" />
                Find Events
              </Link>
              <Link to="/register" className="btn bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 text-base px-8 py-4">
                <Zap className="h-5 w-5 mr-2" />
                Create Event
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm animate-fade-in animation-delay-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Community Owned</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-300" />
                <span>Built for You</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-24">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fafaf9"/>
          </svg>
        </div>
      </section>

      {/* For Attendees Section */}
      <section className="section bg-warmgray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge-coral mb-4">For Attendees</span>
            <h2 className="text-heading-lg md:text-display-sm font-bold text-warmgray-900 mb-4 mt-4">
              Discover Amazing Events
            </h2>
            <p className="text-body-lg text-warmgray-600 max-w-2xl mx-auto">
              Find events near you, buy tickets in seconds, and enjoy seamless entry with digital tickets.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, title: 'Discover Events', desc: 'Find events near you or browse by category', color: 'coral' },
              { icon: Ticket, title: 'Instant Tickets', desc: 'Buy tickets in seconds with Apple Pay & Google Pay', color: 'violet' },
              { icon: Shield, title: 'Secure Payments', desc: 'Your data is protected with bank-level security', color: 'success' },
              { icon: Zap, title: 'Fast Entry', desc: 'Show your digital ticket and walk right in', color: 'warning' },
            ].map((feature, i) => (
              <div key={i} className="card-hover p-6 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                  feature.color === 'coral' ? 'bg-coral-100 text-coral-600' :
                  feature.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                  feature.color === 'success' ? 'bg-success-100 text-success-600' :
                  'bg-warning-100 text-warning-600'
                }`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-warmgray-900 text-heading-sm mb-2">{feature.title}</h3>
                <p className="text-warmgray-600 text-body-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizers Section */}
      <section className="section bg-warmgray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge bg-coral-500/20 text-coral-400 mb-4">For Organizers</span>
              <h2 className="text-heading-lg md:text-display-sm font-bold mb-6 mt-4">
                Everything You Need to Sell Out Events
              </h2>
              <p className="text-warmgray-400 text-body-lg mb-10">
                From ticket sales to attendee check-in, MilkTix gives you the tools to create 
                unforgettable experiences.
              </p>
              
              <div className="space-y-5">
                {[
                  { icon: Sparkles, text: 'Create beautiful event pages in minutes' },
                  { icon: TrendingUp, text: 'Set up multiple ticket types and pricing tiers' },
                  { icon: Clock, text: 'Track sales in real-time with detailed analytics' },
                  { icon: Shield, text: 'Secure check-in with QR code scanning' },
                  { icon: Zap, text: 'Get paid directly to your bank account' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-coral-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-warmgray-300">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/register" className="btn-primary mt-10 inline-flex">
                Start Creating Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-coral-500/20 to-violet-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-warmgray-800 rounded-2xl p-6 md:p-8 border border-warmgray-700 shadow-2xl">
                {/* Stats Cards */}
                <div className="bg-warmgray-700/50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-warmgray-400 text-sm">Total Revenue</span>
                    <span className="badge-success text-xs">+24% this month</span>
                  </div>
                  <div className="text-4xl font-bold text-white">$24,580</div>
                  <div className="mt-4 h-2 bg-warmgray-600 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 gradient-coral rounded-full"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-warmgray-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-coral-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-warmgray-400 text-sm">Tickets Sold</div>
                  </div>
                  <div className="bg-warmgray-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-violet-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-warmgray-400 text-sm">Active Events</div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="mt-6 bg-warmgray-700/50 rounded-xl p-5">
                  <div className="text-warmgray-400 text-sm mb-4">Weekly Sales</div>
                  <div className="flex items-end justify-between gap-2 h-24">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-coral-500 to-coral-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-warmgray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/Simple Fees Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-heading-lg md:text-display-sm font-bold text-warmgray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-body-lg text-warmgray-600 mb-12">
              No monthly fees. No setup costs. Only pay when you sell tickets.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="text-display-sm font-bold text-coral-500 mb-2">2.5%</div>
                <div className="font-semibold text-warmgray-900 mb-1">+ $0.99</div>
                <div className="text-warmgray-600 text-body-sm">per ticket</div>
              </div>
              <div className="card p-6 text-center border-2 border-coral-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-coral text-xs">Most Popular</span>
                </div>
                <div className="text-display-sm font-bold text-coral-500 mb-2">$0</div>
                <div className="font-semibold text-warmgray-900 mb-1">Free Events</div>
                <div className="text-warmgray-600 text-body-sm">no fees at all</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-display-sm font-bold text-violet-600 mb-2">Custom</div>
                <div className="font-semibold text-warmgray-900 mb-1">Enterprise</div>
                <div className="text-warmgray-600 text-body-sm">volume pricing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="gradient-coral rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              <h2 className="text-heading-lg md:text-display-sm font-bold text-white mb-4">
                Ready to transform your events?
              </h2>
              <p className="text-white/90 text-body-lg mb-8 max-w-2xl mx-auto">
                Join thousands of organizers who use MilkTix to sell tickets and grow their audience.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="btn-white text-base px-8 py-4">
                  Get Started Free
                </Link>
                <Link to="/events" className="btn bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 text-base px-8 py-4">
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
