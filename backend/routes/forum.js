const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, toggleLike, addComment, deletePost } = require('../controllers/forumController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, upload.array('images', 3), createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
