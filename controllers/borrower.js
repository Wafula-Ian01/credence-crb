import {Response, Request} from 'express';
import fabric_config from '../config/fabric_config';
import CreditRecord from '../models/Record';


//Register Borrower
export const register=async (req, res)=>{
    try{
        const {PersonalInfo, ContactInfo}= req.body
        const borrowerId= uuidv4()

        await fabric_config.registerUser(borrowerId, 'borrower')

        const{gateway, contract}= await fabric_config.getContract('admin')

        const borrowerData={
            id: borrowerId,
            PersonalInfo,
            ContactInfo,
            CreditRecord: [],
            registrationdate: new Date().toISOString(),
            isActive: true
        }

        await contract.submitTransaction('CreateBorrower', JSON.stringify(borrowerData))
        await gateway.disconnect()
        res.status(201).json({message: 'Borrower registered successfully', borrowerId, success: true})
    }
    catch(error){
        console.error('Error registering borrower:', error)
        res.status(500).json({message: 'Failed to register borrower', error: error.message, success: false})
    }
}

//Get borrower profile
export const getProfile = async (req, res) => {
    try {
        const { borrowerId } = req.params

        const { gateway, contract } = await fabric_config.getContract('admin')

        const result = await contract.evaluateTransaction('GetBorrower', borrowerId)
        await gateway.disconnect()
        const borrower = JSON.parse(result.toString())

        res.status(200).json({ message: 'Borrower profile retrieved successfully', borrower, success: true })
    } catch (error) {
        console.error('Error retrieving borrower profile:', error)
        res.status(500).json({ message: 'Failed to retrieve borrower profile', error: error.message, success: false })
    }
}

//submit credit information
export const submitCreditInfo = async (req, res) => {
    try {
        const { borrowerId} = req.params
        const creditData = req.body

        const creditRecord = new CreditRecord({
            ...creditData,
            borrowerId,
            timestamp: new Date().toISOString(),
        })

        const { gateway, contract } = await fabric_config.getContract('admin')

        await contract.submitTransaction('SubmitCreditRecord', JSON.stringify(creditRecord))
        await gateway.disconnect()

        res.status(201).json({ message: 'Credit information submitted successfully', creditRecord, success: true })
    } catch (error) {
        console.error('Error submitting credit information:', error)
        res.status(500).json({ message: 'Failed to submit credit information', error: error.message, success: false })
    }
}

//get credit score for specific lend type
export const getCreditScore = async (req, res) => {
    try {
        const { borrowerId, lenderType } = req.params

        const { gateway, contract } = await fabric_config.getContract('admin')

        const result = await contract.evaluateTransaction('GetCreditScore', borrowerId, lenderType)
        await gateway.disconnect()

        const creditScore = JSON.parse(result.toString())

        res.status(200).json({creditScore, success: true })
    } catch (error) {
        console.error('Error retrieving credit score:', error)
        res.status(500).json({ message: 'Failed to retrieve credit score', error: error.message, success: false })
    }
}

module.exports = {
    register,
    getProfile,
    submitCreditInfo,
    getCreditScore
}