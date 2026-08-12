const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { asyncHandler } = require('../utils/helpers');

exports.getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active !== 'false') filter.isActive = true;
  if (req.query.department) filter.department = req.query.department;
  const categories = await Category.find(filter).sort('order name');
  res.json({ success: true, data: categories });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate('department', 'name');
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const subcategories = await Subcategory.find({ category: category._id, isActive: true }).sort('order name');
  res.json({ success: true, data: { ...category.toObject(), subcategories } });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category deactivated' });
});

exports.getSubcategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.active !== 'false') filter.isActive = true;
  const subcategories = await Subcategory.find(filter).populate('category', 'name').sort('order name');
  res.json({ success: true, data: subcategories });
});

exports.createSubcategory = asyncHandler(async (req, res) => {
  const sub = await Subcategory.create(req.body);
  res.status(201).json({ success: true, data: sub });
});

exports.updateSubcategory = asyncHandler(async (req, res) => {
  const sub = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' });
  res.json({ success: true, data: sub });
});

exports.deleteSubcategory = asyncHandler(async (req, res) => {
  await Subcategory.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Subcategory deactivated' });
});
