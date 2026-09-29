import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  FaBoxOpen, 
  FaSearch, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaBox, 
  FaTags, 
  FaWallet, 
  FaWarehouse, 
  FaArrowRight, 
  FaTimes 
} from 'react-icons/fa';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', description: '', price: '', category: 'seeds', stock: '', unit: 'kg' 
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search: searchQuery, limit: 50 } });
      setProducts(data.products);
      if (data.products.length > 0 && !selectedProduct) {
        setSelectedProduct(data.products[0]);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setIsEditing(false);
  };

  const startEditing = () => {
    setFormData({ 
      name: selectedProduct.name, 
      description: selectedProduct.description, 
      price: selectedProduct.price, 
      category: selectedProduct.category, 
      stock: selectedProduct.stock, 
      unit: selectedProduct.unit || 'kg'
    });
    setIsEditing(true);
  };

  const startAdding = () => {
    setSelectedProduct(null);
    setFormData({ 
      name: '', description: '', price: '', category: 'seeds', stock: '', unit: 'kg' 
    });
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      imageFiles.forEach(file => data.append('images', file));

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        const res = await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added');
        setSelectedProduct(res.data.product);
      }
      
      setIsEditing(false);
      setImageFiles([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      const remaining = products.filter(p => p._id !== id);
      setProducts(remaining);
      setSelectedProduct(remaining.length > 0 ? remaining[0] : null);
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading && products.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FaBoxOpen className="text-primary-light" /> Inventory Management</h1>
          <p className="page-subtitle">Manage your marketplace products and stock levels.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="search-bar flex-1 md:w-64">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search inventory..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </form>
          <button className="btn btn-primary" onClick={startAdding}>
            <FaPlus /> New Product
          </button>
        </div>
      </div>

      <div className="master-detail-container">
        {/* Master List */}
        <div className="master-list">
          {products.map(p => (
            <div 
              key={p._id} 
              className={`scheme-item ${selectedProduct?._id === p._id ? 'active' : ''}`}
              onClick={() => handleSelectProduct(p)}
            >
              <div className="large-icon-wrapper !w-12 !h-12 !text-xl">
                <img src={p.images?.[0] || 'https://via.placeholder.com/50'} alt="" className="w-full h-full object-cover rounded-md" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-bold truncate mb-1">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold">₹{p.price}</span>
                  <span className={`text-[10px] ${p.stock > 0 ? 'text-success-light' : 'text-danger-light'}`}>
                    {p.stock} in stock
                  </span>
                </div>
              </div>
              <FaArrowRight className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Detail Pane */}
        <div className="detail-pane slide-in">
          {isEditing ? (
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="text-text-muted hover:text-white transition" onClick={() => setIsEditing(false)}>
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group md:col-span-2">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizers">Fertilizers</option>
                    <option value="pesticides">Pesticides</option>
                    <option value="tools">Tools</option>
                    <option value="machinery">Machinery</option>
                    <option value="organic">Organic</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Unit (e.g. kg, liter, piece)</label>
                  <input type="text" className="form-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea className="form-input h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                </div>
                
                {!selectedProduct && (
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Product Images</label>
                    <div className="mt-2 p-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-bg-base/30">
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="product-images" />
                      <label htmlFor="product-images" className="btn btn-outline btn-sm cursor-pointer">Choose Files</label>
                      <p className="text-xs text-text-muted mt-2">{imageFiles.length} files selected</p>
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                  <button type="button" className="btn btn-outline px-8" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-10" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedProduct ? (
            <>
              <div className="detail-header !bg-primary/5">
                <div className="flex justify-between items-start mb-6">
                  <span className="badge badge-green px-4 py-1 text-xs uppercase tracking-widest">{selectedProduct.category}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={startEditing}><FaEdit /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedProduct._id)}><FaTrash /> Delete</button>
                  </div>
                </div>
                <h2 className="text-4xl font-black text-text-primary leading-tight mb-4">{selectedProduct.name}</h2>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-2xl font-display font-bold text-gold">
                    ₹{selectedProduct.price}
                  </div>
                  <div className={`badge ${selectedProduct.stock > 10 ? 'badge-green' : 'badge-red'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} ${selectedProduct.unit || 'kg'} in stock` : 'Out of Stock'}
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1">
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Product Preview</h4>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
                      <img 
                        src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                        alt={selectedProduct.name} 
                        className="w-full h-64 object-cover" 
                      />
                    </div>
                    {selectedProduct.images?.length > 1 && (
                      <div className="flex gap-2 mt-4">
                        {selectedProduct.images.slice(1, 5).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-3">Description</h4>
                      <p className="text-text-secondary leading-relaxed">{selectedProduct.description}</p>
                    </div>
                    
                    <div className="info-grid !mt-0">
                      <div className="info-box flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><FaTags /></div>
                        <div><p className="info-box-label !mb-0">Category</p><p className="font-bold capitalize">{selectedProduct.category}</p></div>
                      </div>
                      <div className="info-box flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center"><FaWallet /></div>
                        <div><p className="info-box-label !mb-0">Unit Price</p><p className="font-bold">₹{selectedProduct.price}</p></div>
                      </div>
                      <div className="info-box flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><FaWarehouse /></div>
                        <div><p className="info-box-label !mb-0">Inventory</p><p className="font-bold">{selectedProduct.stock} {selectedProduct.unit || 'kg'}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center">
              <FaBox className="text-6xl mb-6 opacity-20" />
              <h3 className="text-xl font-bold">No product selected</h3>
              <p className="max-w-xs mt-2">Select a product from the list or add a new one to manage your inventory.</p>
              <button className="btn btn-primary mt-6" onClick={startAdding}>Add First Product</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
