const express = require('express');
const {
  getExperts,
  getExpertById,
  createExpert,
  updateExpert,
  deleteExpert,
} = require('../controllers/expertController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getExperts).post(protect, admin, createExpert);
router
  .route('/:id')
  .get(getExpertById)
  .put(protect, admin, updateExpert)
  .delete(protect, admin, deleteExpert);

module.exports = router;
