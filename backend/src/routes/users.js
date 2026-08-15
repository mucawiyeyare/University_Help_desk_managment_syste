const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, setUserStatus, deleteUser, getAgents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/agents', getAgents);

router.use(authorize('admin', 'manager'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.patch('/:id/status', setUserStatus);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
