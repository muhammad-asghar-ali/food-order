import express  from 'express';
import { deliveryLogin, deliverySignUp } from '../controllers';
import { Authenticate } from '../middlewares';


const router = express.Router();

/* ------------------- Signup / Create Customer --------------------- */
router.post('/signup', deliverySignUp)

/* ------------------- Login --------------------- */
router.post('/login', deliveryLogin)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Change Service Status --------------------- */
router.put('/change-status');

/* ------------------- Profile --------------------- */
router.get('/profile')
router.patch('/profile')


export { router as DeliveryRoute}