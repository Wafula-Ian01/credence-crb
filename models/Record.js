// Credit record data model
class CreditRecord {
  constructor(data) {
    this.borrowerId = data.borrowerId;
    this.lenderId = data.lenderId;
    this.lenderType = data.lenderType; // 'bank', 'mfi', 'sacco', 'other'
    this.loanAmount = data.loanAmount;
    this.loanDate = data.loanDate;
    this.repaymentStatus = data.repaymentStatus;
    this.repaymentHistory = data.repaymentHistory || [];
    this.creditScore = data.creditScore;
    this.verificationStatus = data.verificationStatus || 'pending';
    this.verifiers = data.verifiers || [];
    this.timestamp = data.timestamp || new Date().toISOString();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  static ScoreCalculator(records, lenderType){
    //score segmentations
    const scoreSegments = {
      'bank': { weight: 1, baseScore: 300 },
      'mfi': { weight: 0.8, baseScore: 250 },
      'sacco': { weight: 0.6, baseScore: 200 },
      'other': { weight: 0.4, baseScore: 150 }
    }

    const config= scoreSegments[lenderType] || scoreSegments['other']
    let totalScore = config.baseScore

    records.forEach(record => {
        if (record.lenderType===lenderType && record.isActive){
            //payment history weight 35%
            const paymentScore= this.calculatePaymentScore(record.repaymentHistory)
            totalScore += paymentScore * config.weight * 0.35

            //credit utilization weight 30%
            const utilizationScore= this.calculateUtilizationScore(record)
            totalScore += utilizationScore * config.weight * 0.30

            //length of credit history weight 15%
            const historyScore= this.calculateHistoryScore(record.loanDate)
            totalScore += historyScore * config.weight * 0.15

            //credit mix weight 10%
            const mixScore= this.calculateMixScore(records)
            totalScore += mixScore * config.weight * 0.10

            //new credit weight 10%
            const newCreditScore = this.calculateNewCreditScore(records)
            totalScore += newCreditScore * config.weight * 0.10
        }
    })

    return Math.min(Math.max(totalScore, 150), 850); // Ensure score is between 150 and 850
  }

  static calculatePaymentScore(repaymentHistory) {
    if(!repaymentHistory || repaymentHistory.length===0) return 0

    const onTimePayments = repaymentHistory.filter(payment => payment.status === 'on-time').length;
    const totalPayments = repaymentHistory.length;

    return totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;
  }

  static calculateUtilizationScore(record) {
    if (!record.loanAmount || record.loanAmount <= 0) return 0;

    const utilizationRate = record.repaymentHistory.reduce((acc, payment) => acc + payment.amount, 0) / record.loanAmount;
    return Math.max(0, 100 - (utilizationRate * 100)); // Ensure score is between 0 and 100
  }

  static calculateHistoryScore(loanDate) {
    if (!loanDate) return 0;

    const loanYear = new Date(loanDate).getFullYear()
    const currentYear = new Date().getFullYear()
    const yearsOfCredit = currentYear - loanYear
    const monthsDiff = (yearsOfCredit) / (1000 * 60 * 60 * 24 * 30)

    return Math.min(monthsDiff * 20, 100); 
  }

  static calculateMixScore(records) {
    const uniqueLenders = new Set(records.map(record => record.lenderType));
    return Math.min(uniqueLenders.size * 25, 100); // Max score of 100 for diverse credit mix
  }

  static calculateNewCreditScore(records) {

    const recentRecords = records.filter(r => {
      const monthsAgo = (new Date() - new Date(r.loanDate)) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 6;
    });
    
    return Math.max(0, 100 - (recentRecords.length * 20));
  }
}

module.exports = CreditRecord;