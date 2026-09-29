import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaLeaf, FaShoppingBasket, FaUserMd, FaArrowRight, FaCommentDots } from 'react-icons/fa';

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'expert') navigate('/expert');
      else navigate('/farmer');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base overflow-hidden">
      {/* Nav */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-10">
        <div className="topbar-brand text-2xl">
          <FaLeaf className="brand-icon text-3xl" />
          <span>Farm <span className="brand-accent">Fusion</span></span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn btn-outline">Log in</Link>
          <Link to="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,17,23,0.7)] to-bg-base z-10"></div>
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" alt="Farm" className="w-full h-full object-cover opacity-30" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto fade-in">
          <span className="badge badge-gold mb-6 text-sm px-4 py-1">The Future of Agriculture is Here</span>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight">
            Empowering Farmers.<br/>Connecting <span className="text-primary-light">Experts.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            A unified digital ecosystem for modern agriculture. Buy quality products, consult with top agricultural experts via video, and stay updated with the latest farming schemes.
          </p>
          <button onClick={handleCTA} className="btn btn-primary btn-lg text-lg px-8 py-4 glow-green inline-flex items-center gap-3">
            Get Started for Free <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
            <p className="text-text-secondary">Designed specifically for the agricultural community of India.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-primary">
              <div className="w-14 h-14 rounded-xl bg-primary-glow text-primary-light flex items-center justify-center text-2xl mb-6">
                <FaShoppingBasket />
              </div>
              <h3 className="text-xl font-bold mb-3">E-Commerce Marketplace</h3>
              <p className="text-text-secondary">Buy verified seeds, fertilizers, and machinery directly from trusted sellers at the best market prices.</p>
            </div>
            
            <div className="card hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-gold glow-gold relative z-10 scale-105">
              <div className="w-14 h-14 rounded-xl bg-[rgba(240,180,41,0.15)] text-gold flex items-center justify-center text-2xl mb-6">
                <FaUserMd />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Consultations</h3>
              <p className="text-text-secondary">Book 1-on-1 video consultations with certified agricultural scientists and crop disease specialists.</p>
            </div>
            
            <div className="card hover:-translate-y-2 transition-transform duration-300 border-t-4 border-t-blue-500">
              <div className="w-14 h-14 rounded-xl bg-[rgba(59,130,246,0.15)] text-blue-400 flex items-center justify-center text-2xl mb-6">
                <FaCommentDots />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Community</h3>
              <p className="text-text-secondary">Join forums, chat with peers, and get real-time alerts on weather forecasts and government schemes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-sm text-text-muted relative z-10">
        <p>&copy; {new Date().getFullYear()} Farm Fusion. All rights reserved.</p>
      </footer>
    </div>
  );
}
