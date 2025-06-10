import {Router} from 'express'
import { register } from '../controllers/borrower'
import { registerUser } from '../config/fabric_config'

const authRouter= Router()

authRouter.get('/register', registerUser)
authRouter.get('/:borrowerId', getProfile)
authRouter.post('/:borrowerId/credit', submitCreditInfo)
authRouter.post('/:borrowerId/credit/:lenderType', getCreditScore)