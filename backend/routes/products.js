const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
