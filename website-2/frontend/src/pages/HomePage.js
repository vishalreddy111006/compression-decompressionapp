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
      color: "text-green-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "AI-powered summaries generated in seconds with local processing.",
      color: "text-yellow-400"
    },
    {
      icon: Brain,
      title: "Smart AI",
      description: "Advanced TinyLLaMA model for intelligent content understanding.",
      color: "text-purple-400"
    },
    {
      icon: Users,
      title: "Social Features",
      description: "Share summaries, follow users, and discover content together.",
      color: "text-blue-400"
    },
    {
      icon: Globe,
      title: "Universal",
      description: "Works with any website through our Chrome extension.",
      color: "text-cyan-400"
    },
    {
      icon: Cpu,
      title: "Local Processing",
      description: "No external API calls. Everything runs on your machine.",
      color: "text-red-400"
    }
  ];

  const stats = [
    { value: "100%", label: "Privacy Protected" },
    { value: "0ms", label: "Data Transmission" },
    { value: "AI", label: "Local Processing" },
    { value: "∞", label: "Unlimited Usage" }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Privacy-First AI Summarization</span>
          </div>
          
          <h1 className="hero-title">
            Transform Any Content Into
            <span className="gradient-text"> Intelligent Summaries</span>
          </h1>
          
          <p className="hero-description">
            Experience the future of content consumption with our privacy-focused AI platform. 
            Process, summarize, and share content without compromising your data.
          </p>
          
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              <Zap size={20} />
              Get Started Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
          
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2 className="section-title">Why Choose SummarizeAI?</h2>
          <p className="section-description">
            Built for privacy, speed, and intelligence. Experience the next generation of content processing.
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon size={24} className={feature.color} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Three simple steps to intelligent content summarization
          </p>
        </div>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Install & Browse</h3>
              <p>Install our Chrome extension and browse any website normally</p>
            </div>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>AI Processing</h3>
              <p>Our local AI processes content privately on your device</p>
            </div>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Smart Summaries</h3>
              <p>Get intelligent summaries and share with your network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Banner */}
      <section className="privacy-banner">
        <div className="privacy-content">
          <div className="privacy-icon">
            <Shield size={40} />
          </div>
          <div className="privacy-text">
            <h3>Your Privacy is Our Priority</h3>
            <p>
              All content processing happens locally on your device. We never see, store, 
              or transmit your original content. Only you control your data.
            </p>
            <div className="privacy-features">
              <div className="privacy-feature">
                <Check size={16} />
                <span>No external API calls</span>
              </div>
              <div className="privacy-feature">
                <Check size={16} />
                <span>Local AI processing</span>
              </div>
              <div className="privacy-feature">
                <Check size={16} />
                <span>Zero data collection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Content Experience?</h2>
          <p className="cta-description">
            Join thousands of users who've already discovered the power of private AI summarization.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            <Sparkles size={20} />
            Start Your Journey
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <style jsx>{`
        .homepage {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          padding: 2rem;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: -1;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #00d4ff, #7c3aed);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #7c3aed, #ef4444);
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #10b981, #00d4ff);
          bottom: 20%;
          left: 60%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .hero-content {
          max-width: 800px;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 50px;
          color: var(--accent-primary);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .gradient-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Features Section */
        .features {
          padding: 5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .section-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: var(--gradient-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* How It Works */
        .how-it-works {
          padding: 5rem 2rem;
          background: var(--bg-secondary);
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
        }

        .step-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .step-content p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .step-connector {
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
          margin: 0 1rem;
        }

        /* Privacy Banner */
        .privacy-banner {
          padding: 4rem 2rem;
          background: var(--bg-card);
        }

        .privacy-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .privacy-icon {
          color: var(--accent-success);
          flex-shrink: 0;
        }

        .privacy-text h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .privacy-text p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .privacy-features {
          display: flex;
          gap: 1.5rem;
        }

        .privacy-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-success);
          font-size: 0.875rem;
        }

        /* CTA Section */
        .cta {
          padding: 5rem 2rem;
          text-align: center;
          background: var(--bg-primary);
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .cta-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .steps-container {
            flex-direction: column;
            gap: 2rem;
          }
          
          .step-connector {
            width: 2px;
            height: 50px;
            background: linear-gradient(180deg, transparent, var(--accent-primary), transparent);
          }
          
          .privacy-content {
            flex-direction: column;
            text-align: center;
          }
          
          .privacy-features {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
