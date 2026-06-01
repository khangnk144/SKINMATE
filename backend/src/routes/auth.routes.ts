import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Public auth endpoints: nguoi dung chua co token van goi duoc.
// Controller se validate body, service se hash password/tao JWT.
router.post('/register', register);
router.post('/login', login);

export default router;
