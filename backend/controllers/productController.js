const Product = require('../models/Product');
const Review = require('../models/Review');
const { paginate, formatImageUrl } = require('../utils/helpers');

// GET /api/v1/products
const getProducts = async (req, res) => {
  const { page, limit, category, search, minPrice, maxPrice, sort } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit, 12);
  console.log('PAGINATION DEBUG:', { reqQuery: req.query, skip, lim, pg });

  const query = { isActive: true };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };

  const sortOptions = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 } };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(lim).populate('seller', 'name'),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, products, total, page: pg, pages: Math.ceil(total / lim) });
};

// GET /api/v1/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name email location');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const reviews = await Review.find({ targetType: 'product', targetId: product._id }).populate('author', 'name profileImage');
  res.json({ success: true, product, reviews });
};

// POST /api/v1/products (admin)
const createProduct = async (req, res) => {
  const images = req.files ? req.files.map((f) => formatImageUrl(f.path)) : [];
  const product = await Product.create({ ...req.body, images, seller: req.user._id });
  res.status(201).json({ success: true, product });
};

// PUT /api/v1/products/:id (admin)
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// DELETE /api/v1/products/:id (admin)
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deactivated' });
};

// GET /api/v1/products/featured
const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true }).limit(8).populate('seller', 'name');
  res.json({ success: true, products });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts };
