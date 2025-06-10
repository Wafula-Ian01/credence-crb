import {Router} from 'express'
import { register } from '../controllers/borrower'
import { registerUser } from '../config/fabric_config'

const borrowerRouter= Router()

borrowerRouter.get('/register', registerUser)
borrowerRouter.get('/:borrowerId', getProfile)
borrowerRouter.post('/:borrowerId/credit', submitCreditInfo)
borrowerRouter.post('/:borrowerId/credit/:lenderType', getCreditScore)

module.exports = borrowerRouter