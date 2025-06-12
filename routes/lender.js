import {Router} from 'express'
import {register, requestCreditInfo, consensualCreditInfoRequest} from '../controllers/lenderController.js'

const lenderRouter= Router()

lenderRouter.post('/register', register)
lenderRouter.post('/request-credit', requestCreditInfo)
lenderRouter.get('/credit/:borrowerId', consensualCreditInfoRequest)

module.exports= lenderRouter