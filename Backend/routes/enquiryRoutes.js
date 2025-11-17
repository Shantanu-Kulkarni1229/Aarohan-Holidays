import express from 'express';
import {
  createEnquiry,
  getEnquiryByReference,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addCommunication,
  deleteEnquiry,
  getEnquiryStats,
  getPendingEnquiries,
  getUrgentEnquiries
} from '../controllers/enquiryController.js';

const router = express.Router();

// Public routes
router.post('/enquiries', createEnquiry);
router.get('/enquiries/reference/:reference', getEnquiryByReference);

// Admin routes (add authentication middleware later)
router.get('/admin/enquiries', getAllEnquiries);
router.get('/admin/enquiries/stats', getEnquiryStats);
router.get('/admin/enquiries/pending', getPendingEnquiries);
router.get('/admin/enquiries/urgent', getUrgentEnquiries);
router.get('/admin/enquiries/:id', getEnquiryById);
router.put('/admin/enquiries/:id/status', updateEnquiryStatus);
router.post('/admin/enquiries/:id/communication', addCommunication);
router.delete('/admin/enquiries/:id', deleteEnquiry);

export default router;
