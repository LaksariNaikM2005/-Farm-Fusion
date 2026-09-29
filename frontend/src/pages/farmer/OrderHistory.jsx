import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaFileInvoiceDollar, FaBox, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': return <span className="badge badge-blue"><FaCheckCircle /> Confirmed</span>;
      case 'shipped': return <span className="badge badge-gold"><FaTruck /> Shipped</span>;
      case 'delivered': return <span className="badge badge-green"><FaCheckCircle /> Delivered</span>;
      case 'cancelled': return <span className="badge badge-red"><FaTimesCircle /> Cancelled</span>;
      default: return <span className="badge badge-gray">Pending</span>;
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <h1 className="page-title mb-8 flex items-center gap-2"><FaFileInvoiceDollar /> My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <FaBox className="empty-icon" />
          <h3>No orders yet</h3>
          <p>You haven't purchased any products yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order._id} className="card p-0 overflow-hidden">
              <div className="bg-bg-elevated p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6 text-sm">
                  <div><p className="text-text-muted">Order Placed</p><p className="font-semibold">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p></div>
                  <div><p className="text-text-muted">Total</p><p className="font-semibold text-gold">₹{order.totalAmount}</p></div>
                  <div><p className="text-text-muted">Order #</p><p className="font-mono text-xs mt-1">{order._id.slice(-8).toUpperCase()}</p></div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              
              <div className="p-4">
                {order.items.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 py-3 ${i !== order.items.length - 1 ? 'border-b border-border' : ''}`}>
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 rounded object-cover border border-border" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-right">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-bg-elevated p-4 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <FaCreditCard /> Payment: <span className={order.paymentStatus === 'paid' ? 'text-success font-semibold' : 'text-warning font-semibold'}>{order.paymentStatus.toUpperCase()}</span>
                </div>
                <button className="btn btn-outline btn-sm">View Invoice</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
