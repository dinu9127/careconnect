import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  MapPin,
  Award,
  Users,
  Heart,
  Baby,
  Accessibility,
  Clock,
  Shield,
  MessageSquare,
  Star,
  ArrowRight,
} from 'lucide-react'

// Trust metrics
const stats = [
  { icon: Users, label: 'Verified Caregivers', value: '500+', color: 'text-indigo-600' },
  { icon: Heart, label: 'People Served', value: '2000+', color: 'text-rose-600' },
  { icon: Star, label: 'Average Rating', value: '4.8/5', color: 'text-amber-600' },
]

// Service offerings with icons
const services = [
  {
    title: 'Disability Support',
    desc: 'Knowledgeable caregivers for daily living assistance and mobility support.',
    img: '/images/services/disability-support.jpg',
    icon: Accessibility,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    title: 'Elderly Care',
    desc: 'Compassionate support for seniors with companionship and wellbeing focus.',
    img: '/images/services/elderly-care.jpg',
    icon: Heart,
    color: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
  {
    title: 'Child Care',
    desc: 'Safe, vetted in-home childcare from trusted professionals.',
    img: '/images/services/child-care.jpg',
    icon: Baby,
    color: 'bg-sky-100',
    iconColor: 'text-sky-700',
  },
   {
    title: 'Hospital Companionship',
    desc: 'Compassionate support for patients during hospital stays.',
    img: '/images/services/hospital-companionship.jpg',
    icon: Heart,
    color: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
]

// Why choose us - key features
const features = [
  {
    icon: Shield,
    title: 'Verified Caregivers',
    desc: 'Identity and comprehensive background checks for complete peace of mind.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: MapPin,
    title: 'Local Matching',
    desc: 'Find trusted caregivers nearby that fit your schedule and requirements.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    desc: 'Continuous reviews and dedicated support for consistent excellence.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    desc: 'Round-the-clock assistance and reliable customer care whenever needed.',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    icon: MessageSquare,
    title: 'Easy Communication',
    desc: 'Seamless messaging and scheduling directly within the platform.',
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50',
  },
  {
    icon: CheckCircle2,
    title: 'Transparent Pricing',
    desc: 'Clear, upfront pricing with no hidden fees or surprise charges.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
]

// How it works
const steps = [
  {
    step: 1,
    title: 'Create Account',
    desc: 'Sign up in minutes. Tell us about your care needs.',
    icon: Users,
  },
  {
    step: 2,
    title: 'Browse Caregivers',
    desc: 'Filter by expertise, location, availability & ratings.',
    icon: MapPin,
  },
  {
    step: 3,
    title: 'Book & Connect',
    desc: 'Schedule sessions and communicate securely.',
    icon: MessageSquare,
  },
]

// Testimonials/Social proof
const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Family caregiver',
    content: 'CareConnect made finding quality care for my mother incredibly easy and stress-free.',
    rating: 5,
    avatar: '👩‍🦱',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Care recipient',
    content: 'The caregivers are truly compassionate. I feel safe and well-looked-after daily.',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    name: 'Emma Thompson',
    role: 'Professional caregiver',
    content: 'This platform lets me connect with families in need. Truly fulfilling work.',
    rating: 5,
    avatar: '👩‍⚕️',
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo/careconnectlogo.png"
              alt="CareConnect logo"
              className="h-9 w-auto select-none"
              loading="eager"
            />
            <span className="text-xl font-bold text-slate-900">CareConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-700 hover:text-teal-600 font-medium transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className=" gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
              <span className="text-sm font-medium text-indigo-700">Trusted by 2000+ families</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                Welcome to CareConnect!
              </span>
            </h1>

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 mb-6">
              Ensuring Comfort for Your Family Members
            </h2>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Connect with verified, compassionate caregivers across Sri Lanka. From elderly care to childcare,
              disability support to hospital companionship .Find all in one secure platform.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-7 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                Start Finding Care
                <ArrowRight className="w-5 h-5" />
              </Link>
              
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Background verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                <span>4.8★ Rated</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative block w-full max-w-2xl mx-auto lg:ml-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-3xl blur-2xl opacity-40" />
            <div className="relative">
              <img
                src="/images/logo/imagehome.jpg"
                alt="Caregiver and patient"
                className="w-full max-h-[620px] rounded-3xl shadow-2xl ring-1 ring-slate-200 object-cover"
                loading="lazy"
              />
              {/* Floating stat cards */}
              <div className="absolute -bottom-8 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                <div className="text-2xl font-bold text-indigo-700">500+</div>
                <div className="text-xs text-slate-600">Verified caregivers</div>
              </div>
              <div className="absolute top-12 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 flex items-center gap-3">
                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                <div>
                  <div className="text-sm font-bold text-slate-900">4.8</div>
                  <div className="text-xs text-slate-600">User rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section - Mobile optimized */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center hover:shadow-md transition">
              <Icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">{s.label}</div>
            </div>
          )
        })}
      </section>

      {/* Services Section */}
      <section id="services" className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive care solutions tailored to your unique needs and circumstances
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((sv, idx) => {
              const Icon = sv.icon
              return (
                <div
                  key={`${sv.title}-${idx}`}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-300 transition duration-300"
                >
                  <img
                    src={sv.img}
                    alt={sv.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="p-6">
                    <div className={`${sv.color} rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${sv.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{sv.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{sv.desc}</p>
                    <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full group-hover:w-16 transition duration-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Choose CareConnect
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Industry-leading features designed to give you complete confidence and control
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <div
                key={idx}
                className={`${f.bgColor} rounded-2xl border border-slate-100 p-8 hover:shadow-lg hover:border-slate-200 transition`}
              >
                <Icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600">Get started in three simple steps</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="relative">
                {/* Connection line */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-600 to-transparent" />
                )}

                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center hover:shadow-lg transition h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{step.step}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Loved by thousands
          </h2>
          <p className="text-lg text-slate-600">Real stories from families and caregivers</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed italic">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{t.avatar}</div>
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 rounded-3xl p-8 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to find the right care?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of families and caregivers building a better care community today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-12 border-t border-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-6 w-auto" />
              </div>
              <p className="text-sm leading-relaxed">
                Ensuring comfort for your family members across Sri Lanka.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it works</a></li>
                <li><a href="#services" className="hover:text-white transition">Services</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white transition">Elderly Care</a></li>
                <li><a href="#services" className="hover:text-white transition">Child Care</a></li>
                <li><a href="#services" className="hover:text-white transition">Hospital Companionship</a></li>
                <li><a href="#services" className="hover:text-white transition">Disability Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition">Privacy</button></li>
                <li><button className="hover:text-white transition">Terms</button></li>
                <li><button className="hover:text-white transition">Security</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-sm">
                <li>✉ support@careconnect.lk</li>
                <li>📞 +94 (0) 11 123 4567</li>
                <li className="pt-2">Follow us on social media</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
              <p>© {new Date().getFullYear()} CareConnect. All rights reserved.</p>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <button className="hover:text-white transition">Facebook</button>
                <button className="hover:text-white transition">Twitter</button>
                <button className="hover:text-white transition">Instagram</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
