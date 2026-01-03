import { Router } from 'express';
import { body } from 'express-validator';
import {
  // Provinces
  getProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
  // Districts
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict
} from '../controllers/locationController';
import { authenticate, isAdmin, validateRequest } from '../middleware/auth';

const router = Router();

// ==================== PROVINCES ====================

// Get all provinces (public)
router.get('/provinces', getProvinces);

// Get province by ID (public)
router.get('/provinces/:id', getProvinceById);

// Create province (admin only)
router.post(
  '/provinces',
  authenticate,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('name_fa').optional().trim(),
    body('name_ps').optional().trim(),
    body('code').optional().trim()
  ],
  validateRequest,
  createProvince
);

// Update province (admin only)
router.put(
  '/provinces/:id',
  authenticate,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('name_fa').optional().trim(),
    body('name_ps').optional().trim(),
    body('code').optional().trim()
  ],
  validateRequest,
  updateProvince
);

// Delete province (admin only)
router.delete('/provinces/:id', authenticate, isAdmin, deleteProvince);

// ==================== DISTRICTS ====================

// Get all districts (public, can filter by province_id)
router.get('/districts', getDistricts);

// Get district by ID (public)
router.get('/districts/:id', getDistrictById);

// Create district (admin only)
router.post(
  '/districts',
  authenticate,
  isAdmin,
  [
    body('province_id').isInt().withMessage('Province ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('name_fa').optional().trim(),
    body('name_ps').optional().trim(),
    body('code').optional().trim()
  ],
  validateRequest,
  createDistrict
);

// Update district (admin only)
router.put(
  '/districts/:id',
  authenticate,
  isAdmin,
  [
    body('province_id').isInt().withMessage('Province ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('name_fa').optional().trim(),
    body('name_ps').optional().trim(),
    body('code').optional().trim()
  ],
  validateRequest,
  updateDistrict
);

// Delete district (admin only)
router.delete('/districts/:id', authenticate, isAdmin, deleteDistrict);

export default router;
