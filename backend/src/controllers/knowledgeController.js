const KnowledgeArticle = require('../models/KnowledgeArticle');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

exports.getArticles = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (!['agent', 'manager', 'admin'].includes(req.user?.role)) filter.visibility = 'public';
  if (req.query.category) filter.category = req.query.category;
  const { page, limit, skip } = getPagination(req.query);
  const [articles, total] = await Promise.all([
    KnowledgeArticle.find(filter).populate('category', 'name').populate('author', 'name').sort('-createdAt').skip(skip).limit(limit),
    KnowledgeArticle.countDocuments(filter),
  ]);
  res.json({ success: true, data: articles, pagination: paginateResults(total, page, limit) });
});

exports.getArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('category', 'name').populate('author', 'name');
  if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
  res.json({ success: true, data: article });
});

exports.createArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: article });
});

exports.updateArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
  res.json({ success: true, data: article });
});

exports.deleteArticle = asyncHandler(async (req, res) => {
  await KnowledgeArticle.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Article deleted' });
});

exports.searchArticles = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const articles = await KnowledgeArticle.find({
    isPublished: true,
    $or: [{ title: { $regex: q, $options: 'i' } }, { body: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }],
  }).populate('category', 'name').limit(10);
  res.json({ success: true, data: articles });
});

exports.suggestArticles = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  const articles = await KnowledgeArticle.find(filter).limit(5).select('title views');
  res.json({ success: true, data: articles });
});

exports.getAllArticles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
  const [articles, total] = await Promise.all([
    KnowledgeArticle.find(filter).populate('category', 'name').populate('author', 'name').sort('-createdAt').skip(skip).limit(limit),
    KnowledgeArticle.countDocuments(filter),
  ]);
  res.json({ success: true, data: articles, pagination: paginateResults(total, page, limit) });
});
