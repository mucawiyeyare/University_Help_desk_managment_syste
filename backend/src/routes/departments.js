const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addAgent,
  removeAgent,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(authorize('admin'), createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(authorize('admin', 'manager'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

router.post('/:id/agents', authorize('admin', 'manager'), addAgent);
router.delete('/:id/agents', authorize('admin', 'manager'), removeAgent);

module.exports = router;
