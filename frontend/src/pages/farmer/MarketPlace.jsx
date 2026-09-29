import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { addToCart } from '../../store/slices/cartSlice';
import { 
  FaSearch, 
  FaStar, 
  FaShoppingCart, 
  FaBoxOpen, 
  FaCheckCircle, 
  FaArrowRight, 
  FaStore,
  FaTags,
  FaShieldAlt,
  FaTruck,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MarketPlace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Detail State
  const [productDetail, setProductDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  
  const dispatch = useDispatch();
  const categories = ['seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'organic'];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async (searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { search: searchQuery, category, limit: 50 }
      });
      setProducts(data.products);
      if (data.products.length > 0 && !selectedProduct) {
        handleSelectProduct(data.products[0]);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    setDetailLoading(true);
    setQty(1);
    setActiveImg(0);
    try {
      const { data } = await api.get(`/products/${product._id}`);
      setProductDetail(data);
    } catch (err) {
      toast.error('Product details not found');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!productDetail) return;
    dispatch(addToCart({ ...productDetail.product, quantity: qty }));
    toast.success(`${qty}x ${productDetail.product.name} added to cart`);
  };

  if (loading && products.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-7xl mx-auto">
      <div className="page-header mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2"><FaStore className="text-gold" /> Agri Marketplace</h1>
            <p className="page-subtitle">Premium farming essentials from verified sellers.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="search-bar flex-1 md:w-64">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search marketplace..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
        <button 
          className={`badge ${category === '' ? 'badge-gold' : 'badge-gray'} py-1 px-4 cursor-pointer text-xs`}
          onClick={() => setCategory('')}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`badge ${category === cat ? 'badge-gold' : 'badge-gray'} py-1 px-4 cursor-pointer text-xs capitalize`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="master-detail-container">
        {/* Master List (Left Sidebar) */}
        <div className="master-list h-[calc(100vh-280px)] overflow-y-auto">
          {products.length === 0 ? (
            <div className="p-10 text-center opacity-40"><p>No products found.</p></div>
          ) : (
            products.map(p => (
              <div 
                key={p._id} 
                className={`scheme-item ${selectedProduct?._id === p._id ? 'active' : ''}`}
                onClick={() => handleSelectProduct(p)}
              >
                <div className="large-icon-wrapper overflow-hidden">
                  <img src={p.images[0] || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-bold truncate mb-1">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="badge badge-gold !text-[10px] !py-0 capitalize">{p.category}</span>
                    <span className="text-sm font-black text-primary-light">₹{p.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Pane (Right Content) */}
        <div className="detail-pane slide-in h-[calc(100vh-280px)] overflow-y-auto bg-bg-base/30">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center h-full"><div className="spinner"></div></div>
          ) : productDetail ? (
            <>
              <div className="detail-header">
                <div className="flex justify-between items-start mb-6">
                  <span className="badge badge-gold px-4 py-1 text-sm capitalize">{productDetail.product.category}</span>
                  <div className="flex gap-2">
                    {productDetail.product.stock > 0 ? (
                      <span className="badge badge-green px-3 py-1 flex items-center gap-1"><FaCheckCircle /> In Stock</span>
                    ) : (
                      <span className="badge badge-red px-3 py-1">Out of Stock</span>
                    )}
                  </div>
                </div>
                <h2 className="text-3xl font-black text-text-primary leading-tight mb-4">{productDetail.product.name}</h2>
                <div className="flex items-center gap-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-gold" />
                    <span className="font-bold text-text-primary">{productDetail.product.rating.toFixed(1)}</span>
                    <span className="text-text-muted">({productDetail.product.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-border pl-6">
                    <FaTruck className="text-primary-light" />
                    <span>Free Delivery Available</span>
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1">
                <div className="grid lg:grid-cols-2 gap-10">
                  {/* Left Column: Gallery & Description */}
                  <div className="space-y-8">
                    <div className="rounded-3xl overflow-hidden border border-border shadow-2xl h-80 bg-bg-card group relative">
                      <img 
                        src={productDetail.product.images[activeImg] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                        alt="" 
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    {productDetail.product.images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                        {productDetail.product.images.map((img, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setActiveImg(idx)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${activeImg === idx ? 'border-primary shadow-lg' : 'border-transparent opacity-60'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary-light">
                        <FaInfoCircle /> Product Details
                      </h4>
                      <p className="text-text-secondary leading-relaxed text-lg">
                        {productDetail.product.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Purchasing & Specifications */}
                  <div className="space-y-8">
                    <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 glow-green">
                      <p className="text-xs font-bold text-text-muted uppercase mb-2 tracking-widest">Special Price</p>
                      <div className="text-5xl font-black text-text-primary mb-6 flex items-baseline gap-2">
                        ₹{productDetail.product.price}
                        <span className="text-base text-text-muted font-normal">/ {productDetail.product.unit}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center bg-bg-base border border-border rounded-xl overflow-hidden h-14 w-36 shadow-inner">
                          <button 
                            className="flex-1 hover:bg-bg-elevated transition text-xl font-bold" 
                            onClick={() => setQty(Math.max(1, qty - 1))}
                          >-</button>
                          <span className="flex-1 text-center font-black text-lg">{qty}</span>
                          <button 
                            className="flex-1 hover:bg-bg-elevated transition text-xl font-bold" 
                            onClick={() => setQty(Math.min(productDetail.product.stock, qty + 1))}
                          >+</button>
                        </div>
                        <button 
                          className="btn btn-primary flex-1 h-14 text-xl font-black shadow-xl" 
                          onClick={handleAddToCart}
                          disabled={productDetail.product.stock === 0}
                        >
                          <FaShoppingCart className="mr-3" /> Buy Now
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-text-muted justify-center">
                        <FaShieldAlt className="text-success-light" />
                        <span>Secure Transaction • Verified Seller</span>
                      </div>
                    </div>

                    <div className="info-grid !mt-0">
                      <div className="info-box">
                        <p className="info-box-label">Stock Availability</p>
                        <p className="text-text-primary font-bold">{productDetail.product.stock} units available</p>
                      </div>
                      <div className="info-box">
                        <p className="info-box-label">Seller Information</p>
                        <p className="text-text-primary font-bold">{productDetail.product.seller?.name || 'Farm Fusion Direct'}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <FaTags className="text-gold" /> Customer Reviews
                      </h4>
                      <div className="space-y-4">
                        {productDetail.reviews.length === 0 ? (
                          <div className="p-6 text-center rounded-xl bg-bg-base/20 border border-dashed border-border text-sm italic text-text-muted">
                            No reviews yet for this product.
                          </div>
                        ) : (
                          productDetail.reviews.slice(0, 2).map(r => (
                            <div key={r._id} className="p-4 rounded-xl bg-bg-elevated border border-border flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary-light flex items-center justify-center shrink-0 font-bold text-xs">
                                {r.author.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold truncate">{r.author.name}</span>
                                  <div className="flex text-gold text-[8px]">
                                    {[...Array(5)].map((_, i) => <FaStar key={i} className={i < r.rating ? '' : 'opacity-20'} />)}
                                  </div>
                                </div>
                                <p className="text-[11px] text-text-secondary line-clamp-2">{r.comment}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center opacity-30 h-full">
              <FaBoxOpen className="text-8xl mb-6" />
              <h3 className="text-2xl font-bold">Market Showcase</h3>
              <p className="max-w-xs mt-2">Select a product to view its premium features and purchase options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
