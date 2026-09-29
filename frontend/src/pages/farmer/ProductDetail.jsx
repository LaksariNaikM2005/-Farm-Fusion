import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { addToCart } from '../../store/slices/cartSlice';
import { FaArrowLeft, FaStar, FaShoppingCart, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setData(res.data);
      } catch (err) {
        toast.error('Product not found');
        navigate('/farmer/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAdd = () => {
    if (!data) return;
    dispatch(addToCart({ ...data.product, quantity: qty }));
    toast.success(`${qty}x ${data.product.name} added to cart`);
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!data) return null;

  const { product, reviews } = data;

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm mb-6">
        <FaArrowLeft /> Back to Market
      </button>

      <div className="card p-0 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-6 bg-bg-elevated border-r border-border">
            <img 
              src={product.images[activeImg] || 'https://via.placeholder.com/600x400?text=No+Image'} 
              alt={product.name} 
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <img 
                    key={idx} src={img} alt="" 
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${activeImg === idx ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveImg(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-gold capitalize">{product.category}</span>
              {product.stock > 0 ? (
                <span className="badge badge-green"><FaCheckCircle /> In Stock ({product.stock})</span>
              ) : (
                <span className="badge badge-red">Out of Stock</span>
              )}
            </div>
            
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-1 text-gold">
                <FaStar /> <span className="font-bold">{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
                <span className="text-text-muted text-sm ml-1">({product.totalReviews} reviews)</span>
              </div>
              <span className="text-sm text-text-muted border-l border-border pl-4">Sold by: {product.seller?.name || 'Farm Fusion'}</span>
            </div>

            <div className="text-4xl font-display font-bold text-primary-light mb-6">
              ₹{product.price} <span className="text-base text-text-muted font-normal font-body">/ {product.unit}</span>
            </div>

            <p className="text-text-secondary leading-relaxed mb-8 flex-1">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center border border-border rounded-md overflow-hidden h-12 w-32">
                <button className="flex-1 hover:bg-bg-elevated transition" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span className="flex-1 text-center font-bold">{qty}</span>
                <button className="flex-1 hover:bg-bg-elevated transition" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button 
                className="btn btn-primary flex-1 h-12 text-lg" 
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-text-muted">No reviews yet for this product.</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r._id} className="card py-4 px-6">
              <div className="flex items-center gap-3 mb-2">
                {r.author.profileImage ? (
                  <img src={r.author.profileImage} alt="" className="avatar avatar-sm" />
                ) : (
                  <FaUserCircle className="text-2xl text-text-muted" />
                )}
                <div>
                  <p className="font-semibold text-sm">{r.author.name}</p>
                  <p className="text-xs text-text-muted">{format(new Date(r.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="ml-auto flex text-gold text-sm">
                  {[...Array(5)].map((_, i) => <FaStar key={i} className={i < r.rating ? '' : 'empty'} />)}
                </div>
              </div>
              <p className="text-sm text-text-secondary">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
