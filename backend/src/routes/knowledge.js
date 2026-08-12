const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
  suggestArticles,
  getAllArticles,
} = require('../controllers/knowledgeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getArticles);
router.get('/search', searchArticles);
router.get('/suggest', suggestArticles);
router.get('/:id', getArticle);

router.use(protect);

router.get('/admin/all', authorize('admin', 'agent', 'manager'), getAllArticles);
router.post('/', authorize('admin', 'agent', 'manager'), createArticle);
router.put('/:id', authorize('admin', 'agent', 'manager'), updateArticle);
router.delete('/:id', authorize('admin', 'manager'), deleteArticle);

module.exports = router;
