import {Router} from 'express';
import {Car} from '../models/car.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; 
import { multerUpload } from '../middlewares/multerService.js';
import { addCar,deleteCar,getAllCars, getCarById, getCarByUserId,updateCarDetails } from '../controllers/car.controller.js';


const router = Router();


router.post('/addCar',authMiddleware,multerUpload.fields(
    [
        {
          name:"car1",
          maxCount:1
        },
        {
            name:"car2",
            maxCount:1
        }
    ]
),addCar)

router.get('/getAllCars', getAllCars)
router.get('/getCarByid/:carId', getCarById)
router.get('/getCarByUserId', authMiddleware, getCarByUserId)
router.put('/updateCar/:carId',authMiddleware, updateCarDetails)
router.delete('/deletaCar/:carId', deleteCar)


export default router;

