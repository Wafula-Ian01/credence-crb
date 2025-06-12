import fabric_config from '../config/fabric_config'
const { v4: uuidv4 } = require('uuid')

//Register Lender
export const register=async (req, res)=>{
    try{
        const {organizationInfo, lenderType}= req.body
        const lenderId= uuidv4()

        await fabric_config.registerUser(lenderId, 'lender')

        const{gateway, contract}= await fabric_config.getContract('admin')

        const lenderData={
            id: lenderId,
            organizationInfo,
            lenderType,
            registrationdate: new Date().toISOString(),
            isActive: true,
            verificationRequests:[]
        }

        await contract.submitTransaction('CreateLender', JSON.stringify(LenderData))
        await gateway.disconnect()
        res.status(201).json({message: 'Borrower registered successfully', lenderId, success: true})
    }
    catch(error){
        console.error('Error registering lender:', error)
        res.status(500).json({message: 'Failed to register lender', error: error.message, success: false})
    }
}

//request borrower credit information
export const requestCreditInfo = async (req, res) => {
    try {
        const { borrowerId, lenderId, purpose, requestDetails } = req.body;

        const requestData={
            id: uuidv4(),
            borrowerId,
            lenderId,
            purpose,
            requestDetails,
            status: 'pending',
            timestamp: new Date().toISOString(),
            consentGiven: false
        }

        if (!borrowerId || !lenderId) {
            return res.status(400).json({ message: 'Borrower ID and Lender ID are required', success: false });
        }

        const { gateway, contract } = await fabric_config.getContract(lenderId);

        await contract.submitTransaction('RequestCreditInfo', requestData)

        await gateway.disconnect();
        res.status(200).json({ message: 'Credit information request sent successfully', success: true, requestId: requestData.id })
    } catch (error) {
        console.error('Error requesting credit information:', error)
        res.status(500).json({ message: 'Failed to request credit information', error: error.message, success: false })
    }
}

//get borrower consented credit information
export const consensualCreditInfoRequest= async (req, res) => {
    try {
        const { borrowerId } = req.params;
        const { lenderId, lenderType } = req.body;

        if (!borrowerId || !lenderId) {
            return res.status(400).json({ message: 'Borrower ID and Lender ID are required', success: false });
        }

        const { gateway, contract } = await fabric_config.getContract(lenderId);
        // Check if the lender is authorized to access the borrower's credit information
        const consentResult = await contract.evaluateTransaction('CheckConsent', borrowerId, lenderId);
        const hasConsent = JSON.parse(consentResult.toString());

        if (!hasConsent) {
            return res.status(403).json({ message: 'Lender does not have borrower consent to access credit information', success: false });
        }
        // Retrieve consensual credit information
        const creditInfo = await contract.evaluateTransaction('GetCreditInfo', borrowerId, lenderId, lenderType);

        await gateway.disconnect();

        res.status(200).json({ message: 'Consented credit information retrieved successfully', creditInfo: JSON.parse(creditInfo.toString()), success: true });
    } catch (error) {
        console.error('Error retrieving consensual credit information:', error);
        res.status(500).json({ message: 'Failed to retrieve consensual credit information', error: error.message, success: false });
    }
}

module.exports = {
    register,
    requestCreditInfo,
    consensualCreditInfoRequest
}