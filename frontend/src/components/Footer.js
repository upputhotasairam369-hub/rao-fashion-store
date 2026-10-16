import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowUpRight, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import ShippingPolicyModal from './ReturnsExchangesModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import FAQModal from './FAQModal';

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const categories = [
    { name: 'Oversized Tees', path: '/products?category=Oversized%20Tees' },
    { name: 'Hoodies & Sweatshirts', path: '/products?category=Hoodies%20%26%20Sweatshirts' },
    { name: 'Baggy Denim', path: '/products?category=Baggy%20Denim' },
    { name: 'Vintage Shirts', path: '/products?category=Vintage%20Shirts' },
    { name: 'Jackets & Outerwear', path: '/products?category=Jackets%20%26%20Outerwear' },
    { name: 'Accessories', path: '/products?category=Accessories' },
  ];

  return (
    <footer className="bg-[#151515] text-[#F2EFE8] border-t-2 border-[#151515]">
      {/* Editorial Value Strip */}
      <div className="border-b border-[#2A2A2A] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3.5 p-4 border border-[#2A2A2A] bg-[#1A1A1A]">
            <div className="p-2 bg-[#CCFF00] text-[#151515] font-black">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#F2EFE8]">
                AUTHENTIC VINTAGE CURATION
              </h4>
              <p className="text-xs font-mono text-[#9E9C96] mt-1 leading-relaxed">
                Every drop is hand-picked, washed, measured, and condition-verified.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 border border-[#2A2A2A] bg-[#1A1A1A]">
            <div className="p-2 bg-[#CCFF00] text-[#151515] font-black">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#F2EFE8]">
                PAN-INDIA EXPRESS SHIPPING
              </h4>
              <p className="text-xs font-mono text-[#9E9C96] mt-1 leading-relaxed">
                Dispatched in 24 hours. Free express shipping on orders over ₹1,999.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 border border-[#2A2A2A] bg-[#1A1A1A]">
            <div className="p-2 bg-[#CCFF00] text-[#151515] font-black">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#F2EFE8]">
                PRE-LOVED. RE-WORN. REDEFINED.
              </h4>
              <p className="text-xs font-mono text-[#9E9C96] mt-1 leading-relaxed">
                Extending the life cycle of premium streetwear silhouettes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#CCFF00] text-[#151515] flex items-center justify-center font-display font-black text-xl">
                RT
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-[#F2EFE8] uppercase">
                RAO'S THRIFT
              </span>
            </div>
            <p className="font-display font-bold text-sm uppercase tracking-wider text-[#CCFF00]">
              "NOT MADE TO FIT IN."
            </p>
            <p className="text-xs font-mono text-[#9E9C96] max-w-sm leading-relaxed">
              Curated thrift fashion and authentic streetwear culture. We hunt down one-of-one finds, rare 90s cuts, and heavyweight essentials for unfiltered style.
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#2A2A2A] text-[#F2EFE8] hover:bg-[#CCFF00] hover:text-[#151515] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <span className="text-xs font-mono text-[#9E9C96]">
                TAG @RAOSTHRIFT TO GET FEATURED
              </span>
            </div>
          </div>

          {/* Shop Drops */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-widest text-[#CCFF00] mb-4">
              COLLECTIONS
            </h5>
            <ul className="space-y-2.5 text-xs font-mono uppercase tracking-wider">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors flex items-center group"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 ml-1 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Care & Info */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-widest text-[#CCFF00] mb-4">
              CUSTOMER CARE
            </h5>
            <ul className="space-y-2.5 text-xs font-mono uppercase tracking-wider">
              <li>
                <button
                  onClick={() => setActiveModal('shipping')}
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Shipping & Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('returns')}
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Returns & Thrift Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('faq')}
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Sizing & Condition Guide
                </button>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Transparency */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-widest text-[#CCFF00] mb-4">
              LEGAL & STORE
            </h5>
            <ul className="space-y-2.5 text-xs font-mono uppercase tracking-wider">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="text-[#9E9C96] hover:text-[#CCFF00] transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li className="pt-2 text-[11px] text-[#787873]">
                INDEPENDENT LABEL • CURATED IN INDIA
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#787873]">
          <p>© {new Date().getFullYear()} RAO'S THRIFT. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 sm:mt-0">
            ENGINEERED WITH REACT, TAILWIND & FASTAPI • MIT LICENSE
          </p>
        </div>
      </div>

      {/* Modals for Legal & Store Policies */}
      {activeModal === 'shipping' && (
        <ShippingPolicyModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'returns' && (
        <ShippingPolicyModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'privacy' && (
        <PrivacyPolicyModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'terms' && (
        <TermsOfServiceModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'faq' && (
        <FAQModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
    </footer>
  );
};

export default Footer;
