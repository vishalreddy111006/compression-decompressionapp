import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  Brain, 
  ArrowRight,
  Check,
  Globe,
  Lock,
  Cpu
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "All content processed locally. Your data never leaves your device.",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "AI-powered summaries generated in seconds with local processing.",
      color: "text-yellow-500"
    },
    {
      icon: Brain,
      title: "Smart AI",
      description: "Advanced TinyLLaMA model for intelligent content understanding.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Social Features",
      description: "Share summaries, follow users, and discover content together.",
      color: "text-blue-500"
    },
    {
      icon: Globe,
      title: "Universal",
      description: "Works with any website through our Chrome extension.",
      color: "text-cyan-500"
    },
    {
      icon: Cpu,
      title: "Local Processing",
      description: "No external API calls. Everything runs on your machine.",
      color: "text-red-500"
    }
  ];

  const stats = [
    { value: "100%", label: "Privacy Protected" },
    { value: "0ms", label: "Data Transmission" },
    { value: "AI", label: "Local Processing" },
    { value: "∞", label: "Unlimited Usage" }
  ];

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="page-header">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-1 rounded-full shadow-sm">
            <Sparkles size={16} className="text-orange-500" />
            <span className="text-sm font-semibold">Privacy-First AI Summarization</span>
          </div>
          <h1 className="heading-xl mt-6">
            Transform Any Content Into <span className="gradient-text">Intelligent Summaries</span>
          </h1>
          <p className="text-secondary text-lg mt-4 max-w-2xl mx-auto">
            Experience the future of content consumption with our privacy-focused AI platform. 
            Process, summarize, and share content without compromising your data.
          </p>
          <div className="hero-buttons mt-6 flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn btn-primary">
              <Zap size={20} /> Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
          <div className="hero-stats grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-accent">{stat.value}</div>
                <div className="text-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-16">
        <h2 className="heading-lg text-center mb-2">Why Choose MindTrail?</h2>
        <p className="text-secondary text-center mb-10 max-w-xl mx-auto">
          Built for privacy, speed, and intelligence. Experience the next generation of content processing.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {features.map((feature, index) => (
            <div key={index} className="card flex flex-col items-center text-center">
              <div className={`rounded-full p-3 bg-white shadow ${feature.color} mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-secondary text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-20">
        <h2 className="heading-lg text-center mb-6">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="card w-full max-w-sm text-center">
            <div className="text-accent font-bold text-2xl mb-2">1</div>
            <h3 className="font-semibold mb-1">Install & Browse</h3>
            <p className="text-muted text-sm">Install our Chrome extension and browse any website normally</p>
          </div>
          <div className="card w-full max-w-sm text-center">
            <div className="text-accent font-bold text-2xl mb-2">2</div>
            <h3 className="font-semibold mb-1">AI Processing</h3>
            <p className="text-muted text-sm">Our local AI processes content privately on your device</p>
          </div>
          <div className="card w-full max-w-sm text-center">
            <div className="text-accent font-bold text-2xl mb-2">3</div>
            <h3 className="font-semibold mb-1">Smart Summaries</h3>
            <p className="text-muted text-sm">Get intelligent summaries and share with your network</p>
          </div>
        </div>
      </section>

      {/* Privacy Banner */}
      <section className="mt-20 bg-tertiary p-8 rounded-xl shadow">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="text-accent-success">
            <Shield size={40} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Privacy is Our Priority</h3>
            <p className="text-secondary mb-4">All content processing happens locally on your device. We never see, store, or transmit your original content.</p>
            <div className="flex flex-wrap gap-4 text-accent-success text-sm">
              <div className="flex items-center gap-1"><Check size={16} /> No external API calls</div>
              <div className="flex items-center gap-1"><Check size={16} /> Local AI processing</div>
              <div className="flex items-center gap-1"><Check size={16} /> Zero data collection</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="heading-lg mb-4">Ready to Transform Your Content Experience?</h2>
        <p className="text-muted mb-6 max-w-xl mx-auto">
          Join thousands of users who've already discovered the power of private AI summarization.
        </p>
        <Link to="/register" className="btn btn-primary">
          <Sparkles size={20} /> Start Your Journey <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
