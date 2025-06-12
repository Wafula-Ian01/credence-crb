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
        const lenderData= wait ctx.stub.getState(lenderId)
        if(!lenderData || lenderData.length===0){
            throw new Error(`Lender ${lenderId} does not exist`)
        }
        return lenderData.toString()
    }
}

