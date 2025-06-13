'use strict'

const {Contract}= require('fabric-contract-api')

class CRBContract extends Contract{
    //initialize Ledger
    async initLedger(ctx){
        console.log('Credence ledger initialized')

        // Set initial data
        const initialData={
            version: '1.0.0',
            initialized: true,
            timestamp: new Date().toISOString
        }

        await ctx.stub.putState('LEDGER_INFO', Buffer.from(JSON.stringify(initialData)))
        return JSON.stringify(initialData)
    }

    //Borrower Functions
    async CreateBorrower(ctx, BorrowerDataString){
        const borrowerData= JSON.parse(BorrowerDataString)
        const borrowerId= borrowerData.id

        //check if borrower already exists
        const existingBorrower= await ctx.stub.getState(borrowerId)
        if(existingBorrower && existingBorrower.length>0){
            throw new Error(`Borrower ${borrowerId} already exists.`)
        }

        //store borrower data
        await ctx.stub.putState(borrowerId, Buffer.from(BorrowerDataString))

        //create composite key for borrower type
        const borrowerTypeKey= ctx.stub.createCompositeKey('borrower', [borrowerId])
        await ctx.stub.putState(borrowerTypeKey, Buffer.from(BorrowerDataString))

        console.log(`Borrower ${borrowerId} created successfully`)
        return JSON.stringify(borrowerData)
    }

    async GetBorrower(ctx, borrowerId){
        const borrowerData= await ctx.stub.getState(borrowerId)
        if(!borrowerData || borrowerData.length===0){
            throw new Error(`Borrower ${borrowerId} does not exist.`)
        }
        return borrowerData.toString()
    }

    //Lender management functions
    async CreateLender(ctx, LenderDataString){
        const lenderData= JSON.parse(LenderDataString)
        const lenderId= lenderData.id

        //check if lender already exists
        const existingLender= await ctx.stub.getState(lenderId)
        if(existingLender && existingLender.length>0){
            throw new Error(`Lender ${lenderId} already exists.`)
        }

        //store lender data
        await ctx.stub.putState(lenderId, Buffer.from(LenderDataString))

        //create composite key for lendr type
        const lenderTypeKey= ctx.stub.createCompositeKey('lender', [lenderId])
        await ctx.stub.putState(lenderTypeKey, Byffer.from(LenderDataString))

        console.log(`Lender ${lenderId} created successfully`)
        return JSON.stringify(lenderData)
    }

    async GetLender(ctx, lenderId){
        const lenderData= await ctx.stub.getState(lenderId)
        if(!lenderData || lenderData.length===0){
            throw new Error(`Lender ${lenderId} does not exist`)
        }
        return lenderData.toString()
    }

    //credit Record Management
    async SubmitCreditRecord(ctx, creditRecordString){
        const creditRecord= JSON.parse(creditRecordString)
        const recordId= `CREDIT_${creditRecord.id}_${Date.now()}`

        //check validity of borrower
        const borrowerData= await ctx.stub.getState(creditRecord.borrowerId)
        if(!borrowerData || borrowerData.length===0){
            throw new Error(`Borrower ${creditRecord.borrowerId} does not exist.`)
        }
        
        //Add record id and set initial verification fields
        creditRecord.id= recordId
        creditRecord.verificationStatus= 'PENDING'
        creditRecord.verifiers=[]
        creditRecord.verificationCount= 0
        creditRecord.consensusReached= false

        //store credit record
        await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(creditRecord)))

        //create composite key for querying
        const borrowCreditkey= await ctx.stub.createCompositeKey('borrower_credit', [creditRecord.borrowerId, recordId])
        await ctx.stub.putState(borrowCreditkey, Buffer.from(JSON.stringify(creditRecord)))

        const lenderCreditKey= await ctx.stub.createCompositeKey('lender_credit', [creditRecord.lenderId, recordId])
        await ctx.stub.putState(lenderCreditKey, Buffer.from(JSON.stringify(creditRecord)))

        //Emit event for verification data request
        await ctx.stub.setEvent('CreditRecordSubmitted', Buffer.from(JSON.stringify({
            recordId,
            borrowerId: creditRecord.borrowerId,
            lenderId: creditRecord.lenderId,
            lenderType: creditRecord.lenderType,
            timestamp: new Date().toISOString()
        })))
        console.log(`Credit record ${recordId} submitted for verification`)
        return JSON.stringify(creditRecord)
    }

    async GetCreditRecord(ctx, recordid){
        const creditRecord= await ctx.stub.getState(recordid)
        if(!creditRecord || creditRecord.length===0){
            throw new Error(`Credit record ${recordid} does not exist.`)
        }
        return creditRecord.toString()
    }

    async RequestCreditInfo(ctx){}

    async CheckConsent(ctx){}

}

