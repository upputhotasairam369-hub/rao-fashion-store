import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ArrowUpRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api, endpoints } from '../api/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.products.featured);
      setFeaturedProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const curatedCategories = [
    {
      name: 'Oversized Tees',
      tagline: 'Heavyweight 280GSM & Archival Graphics',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Oversized%20Tees',
      count: '4 PIECES'
    },
    {
      name: 'Hoodies & Sweatshirts',
      tagline: 'Sun-Faded Wash & 90s Boxy Pullovers',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Hoodies%20%26%20Sweatshirts',
      count: '3 PIECES'
    },
    {
      name: 'Baggy Denim',
      tagline: 'Carpenter Silhouettes & Wide-Leg Flairs',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Baggy%20Denim',
      count: '3 PIECES'
    },
    {
      name: 'Vintage Shirts',
      tagline: 'Shadow Plaids & Camp-Collar Rayons',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Vintage%20Shirts',
      count: '2 PIECES'
    },
    {
      name: 'Jackets & Outerwear',
      tagline: 'Chore Workwear & Two-Tone Track Bombers',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Jackets%20%26%20Outerwear',
      count: '2 PIECES'
    },
    {
      name: 'Accessories',
      tagline: 'Ribbed Beanies & Utility Crossbody Slings',
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
      path: '/products?category=Accessories',
      count: '2 PIECES'
    },
  ];

  const communityFits = [
    {
      user: '@karan_fits',
      item: '90s Raw Carpenter Denim',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    },
    {
      user: '@riya_archive',
      item: 'Sun-Faded Charcoal Hoodie',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
    },
    {
      user: '@delhi_underground',
      item: 'Acid Wash Nirvana Band Tee',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&auto=format&fit=crop&q=80',
    },
    {
      user: '@aditya.fits',
      item: 'Vintage Chore Canvas Jacket',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-[#F2EFE8] text-[#151515] min-h-screen">
      
      {/* SECTION A: CINEMATIC STREETWEAR HERO */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden border-b-2 border-[#151515]">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&auto=format&fit=crop&q=85"
            alt="Rao's Thrift Underground Streetwear"
            className="w-full h-full object-cover object-center filter contrast-110 brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/60 to-[#151515]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#151515] border border-[#CCFF00] text-[#CCFF00] text-xs font-mono tracking-widest uppercase mb-6 shadow-brutal-lime">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            <span>DROP 04 IS LIVE • ONE-OF-ONE THRIFT FINDS</span>
          </div>

          {/* Primary Headlines */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-9xl text-[#F2EFE8] uppercase tracking-tighter leading-none mb-4 select-none drop-shadow-lg">
            NOT MADE TO <span className="text-[#CCFF00] stroke-text-none">FIT IN.</span>
          </h1>

          <p className="font-display text-lg sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-[#F2EFE8] max-w-3xl mb-3">
            CURATED THRIFT. UNFILTERED STYLE.
          </p>

          <p className="text-sm sm:text-base font-mono text-[#D6D3CD] max-w-xl mb-10 tracking-wide">
            One-of-one finds. Your kind of streetwear. Archival cuts, washed heavyweights, and authentic vintage staples measured down to the inch.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/products?sort_by=newest"
              className="w-full sm:w-auto btn-accent py-4 px-8 text-sm flex items-center justify-center space-x-3 shadow-brutal"
            >
              <span>EXPLORE THE DROP</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto py-4 px-8 bg-transparent text-[#F2EFE8] font-display font-bold text-xs uppercase tracking-widest border-2 border-[#F2EFE8] hover:bg-[#F2EFE8] hover:text-[#151515] transition-all flex items-center justify-center"
            >
              SHOP ALL PIECES
            </Link>
          </div>

          {/* Micro stats banner */}
          <div className="mt-14 pt-8 border-t border-[#FFFFFF]/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[#F2EFE8] font-mono text-xs">
            <div>
              <div className="font-display font-black text-2xl text-[#CCFF00]">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-[#D6D3CD]">HAND-CURATED</div>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-[#CCFF00]">1-OF-1</div>
              <div className="text-[10px] uppercase tracking-widest text-[#D6D3CD]">UNIQUE PIECES</div>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-[#CCFF00]">24HR</div>
              <div className="text-[10px] uppercase tracking-widest text-[#D6D3CD]">FAST DISPATCH</div>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-[#CCFF00]">₹1,999</div>
              <div className="text-[10px] uppercase tracking-widest text-[#D6D3CD]">FREE SHIPPING</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: RESTRAINED BRUTALIST MARQUEE */}
      <section className="bg-[#CCFF00] text-[#151515] py-3.5 border-b-2 border-[#151515] overflow-hidden select-none">
        <div className="animate-marquee-track whitespace-nowrap font-display font-black text-sm sm:text-base tracking-widest uppercase flex items-center">
          <span className="mx-4">ONE OF ONE</span>
          <span>•</span>
          <span className="mx-4">RAO'S THRIFT</span>
          <span>•</span>
          <span className="mx-4">STREETWEAR CULTURE</span>
          <span>•</span>
          <span className="mx-4">CURATED DROPS</span>
          <span>•</span>
          <span className="mx-4">PRE-LOVED. RE-WORN. REDEFINED.</span>
          <span>•</span>
          <span className="mx-4">THE STREET IS YOUR RUNWAY</span>
          <span>•</span>
          <span className="mx-4">NO UNIFORM. JUST YOUR STYLE.</span>
          <span>•</span>
          <span className="mx-4">FRESH DROPS. RARE FINDS.</span>
          <span>•</span>
          <span className="mx-4">ONE OF ONE</span>
          <span>•</span>
          <span className="mx-4">RAO'S THRIFT</span>
          <span>•</span>
          <span className="mx-4">STREETWEAR CULTURE</span>
          <span>•</span>
          <span className="mx-4">CURATED DROPS</span>
          <span>•</span>
          <span className="mx-4">PRE-LOVED. RE-WORN. REDEFINED.</span>
        </div>
      </section>

      {/* SECTION C: SHOP BY CATEGORY (EDITORIAL CARDS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-[#151515] pb-6">
          <div>
            <div className="text-xs font-mono tracking-mega text-[#787873] uppercase mb-1">
              ARCHIVES & SILHOUETTES
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            to="/products"
            className="mt-4 md:mt-0 font-display text-xs font-bold uppercase tracking-widest text-[#151515] hover:text-[#CCFF00] hover:bg-[#151515] px-3 py-2 border border-[#151515] transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedCategories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="group relative h-[380px] bg-[#ECE8DF] border border-[#D6D3CD] overflow-hidden flex flex-col justify-end p-6 hover:border-[#151515] hover:shadow-brutal transition-all"
            >
              {/* Category Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover object-center filter grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/50 to-transparent group-hover:via-[#151515]/40 transition-colors" />

              {/* Tag / Counter */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#151515] text-[#CCFF00] px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase border border-[#CCFF00] font-bold">
                  {category.count}
                </span>
              </div>

              {/* Category Info */}
              <div className="relative z-10">
                <p className="text-[11px] font-mono text-[#D6D3CD] uppercase mb-1">
                  {category.tagline}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#F2EFE8] group-hover:text-[#CCFF00] transition-colors">
                    {category.name}
                  </h3>
                  <div className="w-8 h-8 rounded-none bg-[#F2EFE8] text-[#151515] group-hover:bg-[#CCFF00] flex items-center justify-center transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION D: THE LATEST DROP (JUST DROPPED) */}
      <section className="py-20 bg-white border-y-2 border-[#151515]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-[#151515] uppercase mb-1">
                <Flame size={16} className="text-orange-500" />
                <span className="font-bold">DROP 04 SELECTION</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
                JUST DROPPED.
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#787873] mt-2 max-w-xl">
                Real one-of-one vintage finds and oversized essentials. Each piece is unique and measured by hand.
              </p>
            </div>
            
            <Link
              to="/products?sort_by=newest"
              className="mt-4 md:mt-0 btn-primary flex items-center space-x-2 self-start md:self-auto"
            >
              <span>VIEW FULL DROP</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-[#F2EFE8] border border-[#D6D3CD] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION E: EDITORIAL BRAND STORY */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#151515] text-[#CCFF00] font-mono text-xs uppercase tracking-widest">
              MANIFESTO
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#151515] leading-none">
              GOOD CLOTHES DESERVE ANOTHER STORY.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm font-mono text-[#4A4A46] leading-relaxed">
              <p>
                We reject throwaway fast-fashion and mass-produced uniformity. At RAO'S THRIFT, we scout the subcultural archives: heavyweight boxy tees from late-90s music tours, distressed carpenter denims, washed canvas chores, and authentic retro cuts.
              </p>
              <p>
                Every piece is handpicked for its silhouette, weight, and character. We wash, measure, condition-grade, and document every garment down to the millimeter so you know exactly how it drapes before you put it on.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/products" className="btn-outline-dark">
                FIND YOUR NEXT FIT →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative border-2 border-[#151515] bg-[#ECE8DF] shadow-brutal aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1000&auto=format&fit=crop&q=80"
                alt="Rao's Thrift Editorial Lookbook"
                className="w-full h-full object-cover object-center filter contrast-105"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#151515]/90 backdrop-blur-sm p-4 border border-[#CCFF00] text-[#F2EFE8]">
                <p className="font-display font-black text-sm uppercase text-[#CCFF00]">
                  ARCHIVAL QUALITY GUARANTEE
                </p>
                <p className="text-[11px] font-mono text-[#D6D3CD] mt-0.5">
                  1-OF-1 SILHOUETTES • HAND MEASURED • PRE-WASHED & STERILIZED
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: FEATURED COLLECTION BANNER (THE OVERSIZED EDIT) */}
      <section className="bg-[#151515] text-[#F2EFE8] py-20 border-y-2 border-[#151515] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="px-3 py-1 bg-[#CCFF00] text-[#151515] font-mono text-xs font-black uppercase tracking-widest">
                CURATED CAPSULE
              </span>
              <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-none text-[#F2EFE8]">
                THE OVERSIZED <span className="text-[#CCFF00]">EDIT.</span>
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#D6D3CD] max-w-lg leading-relaxed">
                Drop shoulders. Boxy silhouettes. Heavyweight drape that holds its shape. Curated vintage tees and sun-faded French terry hoodies styled for street-level confidence.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/products?category=Oversized%20Tees"
                  className="btn-accent py-3.5 px-6"
                >
                  SHOP OVERSIZED TEES
                </Link>
                <Link
                  to="/products?category=Hoodies%20%26%20Sweatshirts"
                  className="py-3.5 px-6 bg-transparent text-[#F2EFE8] font-display font-bold text-xs uppercase tracking-widest border border-[#F2EFE8] hover:bg-[#F2EFE8] hover:text-[#151515] transition-all"
                >
                  SHOP HOODIES
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#2A2A2A] aspect-[3/4] overflow-hidden bg-[#222]">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
                  alt="Oversized Boxy Tee"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="border border-[#2A2A2A] aspect-[3/4] overflow-hidden bg-[#222] translate-y-6">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
                  alt="Sun-Faded Distressed Hoodie"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: COMMUNITY FIT CHECK GALLERY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono tracking-widest text-[#787873] uppercase mb-1">
            COMMUNITY & STREET CULTURE
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#151515]">
            FIT CHECK ARCHIVE
          </h2>
          <p className="text-xs sm:text-sm font-mono text-[#787873] mt-2">
            Real people. Raw styling. Tag <span className="font-bold text-[#151515]">#RAOSTHRIFT</span> on Instagram to be archived.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {communityFits.map((fit, idx) => (
            <div
              key={idx}
              className="group relative aspect-[3/4] bg-[#ECE8DF] border border-[#D6D3CD] overflow-hidden"
            >
              <img
                src={fit.image}
                alt={fit.item}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-[#F2EFE8]">
                <p className="font-mono text-xs font-bold text-[#CCFF00]">{fit.user}</p>
                <p className="text-[10px] font-mono text-[#D6D3CD] truncate uppercase">{fit.item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
