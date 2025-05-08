import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
// Import specific icons you want to use from Heroicons
import {
    ArrowRightIcon,
    SparklesIcon, // Example for Ease of Use
    ArrowsRightLeftIcon, // Example for Combined Billing
    CubeTransparentIcon, // Example for Prediction
    UsersIcon, // Example for Roles
    DocumentTextIcon, // Example for Invoice History
    ChartBarIcon, // Example for Analytics
    ShieldCheckIcon // Example for Security
} from '@heroicons/react/24/outline';

// Your features data
const featuresData = [
  { id: 1, icon: SparklesIcon, title: 'Ease of Use & Amazing UI', description: 'Navigate effortlessly with our intuitive and beautifully designed user interface, making inventory management a breeze.' },
  { id: 2, icon: ArrowsRightLeftIcon, title: 'Combined Billing & Inventory', description: 'Generate invoices seamlessly, and watch your stock levels update automatically. No more manual reconciliation!' },
  { id: 3, icon: CubeTransparentIcon, title: 'Intelligent Stock Prediction', description: 'Leverage basic ML to forecast when products might run low, helping you reorder proactively and avoid stockouts.' },
  { id: 4, icon: UsersIcon, title: 'Role-Based Access Control', description: 'Securely manage your system with distinct logins and permissions for administrators and employees.' },
  { id: 5, icon: DocumentTextIcon, title: 'Comprehensive Invoice History', description: 'Easily access and review all past invoices, providing a clear audit trail and customer service insights.' },
  { id: 6, icon: ChartBarIcon, title: 'Insightful Analytics', description: 'Get a daily health check-up of your business with cool analytics, visualizing sales trends and inventory performance.' },
  { id: 7, icon: ShieldCheckIcon, title: 'Robust Security', description: 'Rest assured your data is protected, with security measures tested by our in-house ethical hackers.' },
];

const FeaturesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('FeaturesPage mounted');
    // Add scroll animations later if desired
  }, []);

  // Helper to render the Heroicon component
  const renderFeatureIcon = (IconComponent) => {
    if (!IconComponent) return <span className="text-3xl">❓</span>; // Fallback
    // Apply styling to the imported icon component
    return <IconComponent className="w-8 h-8 text-white" />;
  };

  return (
    // Use background-dark from config, ensure text-main is default
    <div className="min-h-screen bg-background-dark text-text-main flex flex-col items-center scroll-smooth">

      {/* --- Navigation Bar --- */}
      <nav className="w-full p-4 fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-glass-border">
        <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
          <Link to="/" className="text-2xl font-bold tracking-tight bg-gradient-text-orange-pink bg-clip-text text-transparent animate-shine bg-[length:200%_auto]">
            BizTrack
          </Link>
          <div className="space-x-2 md:space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-main bg-background-light/70 border border-glass-border hover:bg-background-light transition duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-accent hover:bg-primary-accent-dark shadow-lg shadow-primary-accent/30 transition duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="w-full min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-16 px-4 bg-gradient-hero relative overflow-hidden">
        {/* Add Subtle background elements if desired (e.g., using ::before/::after or absolutely positioned divs) */}
         {/* <div className="absolute inset-0 opacity-10 bg-[url('/path/to/your/subtle-pattern.svg')]"></div> */}
        <div className="z-10 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
            <TypeAnimation
              sequence={[
                'Tired of manual inventory?', 1500,
                'Tired of tracking sales?', 1500,
                'Simplify your business.', 3000,
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              className="bg-gradient-text-orange-pink bg-clip-text text-transparent" // Apply gradient here
            />
          </h1>
          {/* Fade in the subheadline after the initial animation cycle might start */}
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl md:max-w-2xl mx-auto animate-fadeIn animate-delay-2000">
            <span className="font-semibold text-text-accent">BizTrack</span> streamlines your inventory & billing,
            freeing you to focus on what matters most – growing your business.
          </p>
          <div className="animate-fadeIn animate-delay-2500">
             <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center bg-gradient-primary-accent hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg text-base md:text-lg shadow-xl shadow-primary-accent/30 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-opacity-50"
            >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
        {/* Scroll down indicator (optional) */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
            <a href="#features" aria-label="Scroll down to features">
                <svg className="w-6 h-6 text-text-secondary animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </a>
        </div>
      </header>

      {/* --- Features Section --- */}
      <section id="features" className="w-full py-16 md:py-24 bg-background-light px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-text-main">Why Choose BizTrack?</h2>
          <p className="text-base md:text-lg text-text-secondary text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            Everything you need to manage your inventory, sales, and business insights efficiently.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuresData.map((feature) => (
              <div
                key={feature.id}
                // Glassmorphism style card
                className="bg-background-dark/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-glass-border transform transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-primary-accent/20 hover:border-primary-accent/30"
              >
                <div className="flex items-center justify-center mb-5 w-12 h-12 bg-gradient-primary-accent rounded-lg text-white shadow-lg">
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-text-main">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className="w-full py-8 bg-background-dark border-t border-glass-border text-center text-text-secondary text-sm">
        <div className="container mx-auto px-4">
            <p>© {new Date().getFullYear()} BizTrack. All rights reserved.</p>
            <p className="mt-1">Your smart solution for inventory and sales.</p>
        </div>
      </footer>

    </div>
  );
};

export default FeaturesPage;