import {Router} from 'express'

const lenderRoute= Router()

lenderRoute.get('/register', register)
lenderRoute.post('/request-credit', requestCreditInfo)
lenderRoute.get('/credit/:borrowerId', consensualCreditInfoRequest)

module.exports= lenderRoute