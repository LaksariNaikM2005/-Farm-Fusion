import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity, selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { FaTrash, FaArrowRight, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import api from '../../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useState } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Cart() {
  const cart = useSelector(s => s.cart.items);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill in all shipping details');
    }
    
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const { data } = await api.post('/orders/checkout-session', {
        items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
        shippingAddress: address
      });
      
      if (data.url) {
        if (data.isFallback) {
          dispatch(clearCart());
          toast.success('Local Demo: Order created without real payment');
        }
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to initiate checkout';
      toast.error(message);
      if (message.includes('not found')) {
        toast('Please refresh your cart as some items may no longer be available.', { icon: '🔄' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <FaShoppingCart className="empty-icon" />
        <h3 className="text-2xl font-bold mt-4">Your cart is empty</h3>
        <p className="text-text-muted mt-2 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/farmer/marketplace" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <h1 className="page-title mb-6 flex items-center gap-2"><FaShoppingCart /> Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="card p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={item.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        <span className="font-semibold text-sm max-w-[200px] truncate">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-gold font-bold">₹{item.price}</td>
                    <td>
                      <div className="flex items-center border border-border rounded w-24 overflow-hidden">
                        <button className="flex-1 bg-bg-elevated hover:bg-bg-hover py-1" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))}>-</button>
                        <span className="flex-1 text-center text-sm">{item.quantity}</span>
                        <button className="flex-1 bg-bg-elevated hover:bg-bg-hover py-1" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}>+</button>
                      </div>
                    </td>
                    <td className="font-bold">₹{item.price * item.quantity}</td>
                    <td>
                      <button className="text-danger hover:text-danger-light p-2" onClick={() => dispatch(removeFromCart(item._id))}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline btn-sm mt-4 text-danger border-danger" onClick={() => dispatch(clearCart())}>Clear Cart</button>
        </div>

        <div className="lg:w-96 flex flex-col gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Order Summary</h3>
            <div className="flex justify-between mb-2 text-sm text-text-secondary"><span>Subtotal</span><span>₹{total}</span></div>
            <div className="flex justify-between mb-4 text-sm text-text-secondary"><span>Shipping</span><span className="text-success">Free</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-4">
              <span>Total</span><span className="text-gold">₹{total}</span>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Shipping Details</h3>
            <div className="form-group mb-3">
              <input type="text" className="form-input text-sm" placeholder="Street Address" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
            </div>
            <div className="flex gap-3 mb-3">
              <input type="text" className="form-input text-sm w-1/2" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
              <input type="text" className="form-input text-sm w-1/2" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
            </div>
            <div className="form-group mb-4">
              <input type="text" className="form-input text-sm" placeholder="PIN Code" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
            </div>
            
            <button className="btn btn-primary btn-full flex items-center justify-center gap-2" onClick={handleCheckout} disabled={loading}>
              {loading ? <span className="spinner w-4 h-4 border-2"></span> : <><FaCreditCard /> Checkout securely</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
