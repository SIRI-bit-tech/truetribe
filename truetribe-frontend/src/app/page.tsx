'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      title: "Verified Identity",
      description: "Every user is ID + face verified. No fake accounts, no impersonation.",
      icon: "🛡️",
      color: "from-trust-green to-primary-blue"
    },
    {
      title: "Trust Scoring",
      description: "Community-driven trust scores based on accuracy and reliability.",
      icon: "⭐",
      color: "from-primary-yellow to-primary-orange"
    },
    {
      title: "Scam Protection",
      description: "AI-powered detection prevents fraud and protects your interactions.",
      icon: "🚫",
      color: "from-trust-red to-primary-pink"
    },
    {
      title: "Real Accountability",
      description: "Actions have consequences. Build genuine reputation that matters.",
      icon: "✅",
      color: "from-primary-purple to-primary-blue"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Verified Professional",
      content: "Finally, a social platform where I can trust who I'm talking to. The verification process gave me confidence.",
      avatar: "/testimonial1.jpg",
      trustScore: 0.94
    },
    {
      name: "Marcus Johnson",
      role: "Content Creator",
      content: "My trust score opened doors I never expected. Brands actually reach out because they know I'm authentic.",
      avatar: "/testimonial2.jpg",
      trustScore: 0.89
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Medical Professional",
      content: "Being able to share medical information with verified credentials has helped so many people get accurate health advice.",
      avatar: "/testimonial3.jpg",
      trustScore: 0.97
    }
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 via-primary-purple/30 to-primary-pink/30 transition-all duration-1000"
            style={{ transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.1}deg)` }}
          />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          {/* Floating Elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 rounded-full glass"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
                x: [0, Math.sin(i) * 200, 0],
                y: [0, Math.cos(i) * 100, 0]
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Main Headline */}
            <div className="mb-8">
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-primary-blue via-primary-purple to-primary-pink bg-clip-text text-transparent">
                  TrueTribe
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-2xl md:text-4xl text-white/90 mb-6 font-light"
              >
                The World's First{' '}
                <motion.span 
                  className="text-trust-green font-semibold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Truly Trustworthy
                </motion.span>
                <br />Social Network
              </motion.div>
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Link href="/auth/register">
                <Button size="lg" variant="trust" className="px-12 py-4 text-xl font-semibold">
                  Join the Revolution
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="lg" className="px-12 py-4 text-xl text-white border-2 border-white/30 hover:border-white/60">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="flex justify-center items-center space-x-8 text-white/80"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-trust-green">99.9%</div>
                <div className="text-sm">Verified Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-blue">0</div>
                <div className="text-sm">Scam Reports</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-yellow">24/7</div>
                <div className="text-sm">Protection</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-6">How TrueTribe Works</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Three simple steps to join the most trusted social network ever created
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Verify Your Identity",
                description: "Upload your government ID and take a selfie. Our AI verifies your identity in minutes, ensuring one person = one account.",
                icon: "🆔",
                color: "from-trust-green to-primary-blue"
              },
              {
                step: "02",
                title: "Build Your Trust Score",
                description: "Interact authentically with the community. Your trust score grows based on accuracy, helpfulness, and positive contributions.",
                icon: "⭐",
                color: "from-primary-yellow to-primary-orange"
              },
              {
                step: "03",
                title: "Connect Safely",
                description: "Message, share, and engage with verified users only. Enjoy scam-free interactions with real accountability.",
                icon: "🤝",
                color: "from-primary-purple to-primary-pink"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-6xl font-bold text-white/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-6">Trusted by Verified Users</h2>
            <p className="text-xl text-white/70">
              Real stories from real people building real trust
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="glass rounded-2xl p-8 mx-4">
                      <div className="flex items-center mb-6">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={60}
                          height={60}
                          className="rounded-full mr-4"
                        />
                        <div>
                          <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                          <p className="text-white/70">{testimonial.role}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-trust-green rounded-full mr-2"></div>
                            <span className="text-trust-green text-sm font-medium">
                              {(testimonial.trustScore * 100).toFixed(1)}% Trust Score
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/90 text-lg leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-primary-blue' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Experience Trust?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of verified users who've already discovered what social media should be. 
              Authentic. Trustworthy. Revolutionary.
            </p>
            
            <div className="space-y-4">
              <Link href="/auth/register">
                <Button size="lg" variant="trust" className="px-16 py-5 text-2xl font-semibold">
                  Get Verified Now
                </Button>
              </Link>
              <p className="text-white/60 text-sm">
                Free to join • ID verification required • No fake accounts
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram-Style Footer */}
      <footer className="bg-white/5 border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">TrueTribe</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Jobs</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link href="/guidelines" className="hover:text-white transition-colors">Guidelines</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/verification" className="hover:text-white transition-colors">Verification</Link></li>
                <li><Link href="/trust-score" className="hover:text-white transition-colors">Trust Score</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety</Link></li>
                <li><Link href="/live" className="hover:text-white transition-colors">Live Streaming</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
                <li><Link href="/creators" className="hover:text-white transition-colors">Creators</Link></li>
                <li><Link href="/business" className="hover:text-white transition-colors">Business</Link></li>
                <li><Link href="/developers" className="hover:text-white transition-colors">Developers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/mobile" className="hover:text-white transition-colors">Mobile App</Link></li>
                <li><Link href="/desktop" className="hover:text-white transition-colors">Desktop</Link></li>
                <li><Link href="/verified" className="hover:text-white transition-colors">TrueTribe Verified</Link></li>
                <li><Link href="/ai" className="hover:text-white transition-colors">Trust AI</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/report" className="hover:text-white transition-colors">Report Issue</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div className="text-white/60 text-sm">
              © 2025 TrueTribe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}