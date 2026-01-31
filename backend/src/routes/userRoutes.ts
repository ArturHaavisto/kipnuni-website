import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation rules
const userValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

// Routes
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userValidation, validateRequest, userController.create);
router.put('/:id', userValidation, validateRequest, userController.update);
router.delete('/:id', userController.delete);

export default router;
