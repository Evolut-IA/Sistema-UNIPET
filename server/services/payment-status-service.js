export class PaymentStatusService {
    /**
     * Calculate expiration details based on payment date and billing period
     */
    static calculateExpirationDetails(contract, currentDate) {
        // If no payment received, no expiration date
        if (!contract.receivedDate) {
            return {
                expirationDate: null,
                daysRemaining: 0,
                isExpired: true
            };
        }
        const paymentDate = new Date(contract.receivedDate);
        const billingPeriod = contract.billingPeriod || 'monthly';
        // Calculate expiration days based on billing period
        const expirationDays = billingPeriod === 'annual'
            ? this.ANNUAL_EXPIRATION_DAYS
            : this.MONTHLY_EXPIRATION_DAYS;
        // Calculate expiration date: payment date + expiration days
        const expirationDate = new Date(paymentDate);
        expirationDate.setDate(expirationDate.getDate() + expirationDays);
        // Calculate days remaining
        const msRemaining = expirationDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
        // Check if expired
        const isExpired = currentDate >= expirationDate;
        return {
            expirationDate,
            daysRemaining,
            isExpired
        };
    }
    /**
     * Evaluates the payment status of a contract based on payment history and billing cycle
     */
    static evaluateContractPaymentStatus(contract) {
        const now = new Date();
        // Calculate expiration details first
        const expirationDetails = this.calculateExpirationDetails(contract, now);
        // If contract is already cancelled or suspended manually, respect that
        if (contract.status === 'cancelled') {
            return {
                calculatedStatus: 'cancelled',
                isOverdue: false,
                daysPastDue: 0,
                nextDueDate: null,
                gracePeriodEnds: null,
                shouldSuspend: false,
                shouldCancel: false,
                statusReason: 'Contract manually cancelled',
                expirationDate: expirationDetails.expirationDate,
                daysRemaining: expirationDetails.daysRemaining,
                isExpired: expirationDetails.isExpired
            };
        }
        if (contract.status === 'suspended') {
            return {
                calculatedStatus: 'suspended',
                isOverdue: true,
                daysPastDue: 0,
                nextDueDate: null,
                gracePeriodEnds: null,
                shouldSuspend: false,
                shouldCancel: false,
                statusReason: 'Contract manually suspended',
                expirationDate: expirationDetails.expirationDate,
                daysRemaining: expirationDetails.daysRemaining,
                isExpired: expirationDetails.isExpired
            };
        }
        // Calculate both last due date (most recent that has passed) and next due date
        const lastDueDate = this.calculateLastDueDate(contract, now);
        const nextDueDate = this.calculateNextDueDate(contract, now);
        // Determine if payment was successful based on Cielo return codes
        const hasSuccessfulPayment = this.isPaymentSuccessful(contract);
        // NEW TIME-BASED LOGIC: Use expiration date instead of billing cycles
        if (hasSuccessfulPayment && !expirationDetails.isExpired) {
            // Contract is active and not expired
            const daysToExpiration = expirationDetails.daysRemaining;
            const statusMessage = daysToExpiration > 5
                ? `Ativo - ${daysToExpiration} dias restantes`
                : `Ativo - ${daysToExpiration} dias restantes (renovação necessária em breve)`;
            return {
                calculatedStatus: 'active',
                isOverdue: false,
                daysPastDue: 0,
                nextDueDate: expirationDetails.expirationDate, // Next renewal date
                gracePeriodEnds: null,
                shouldSuspend: false,
                shouldCancel: false,
                statusReason: statusMessage,
                expirationDate: expirationDetails.expirationDate,
                daysRemaining: expirationDetails.daysRemaining,
                isExpired: expirationDetails.isExpired
            };
        }
        // If payment was successful but expired, calculate grace period
        if (hasSuccessfulPayment && expirationDetails.isExpired && expirationDetails.expirationDate) {
            const daysSinceExpiration = Math.floor((now.getTime() - expirationDetails.expirationDate.getTime()) / (1000 * 60 * 60 * 24));
            const gracePeriodEnds = new Date(expirationDetails.expirationDate.getTime() + (this.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000));
            if (daysSinceExpiration <= this.GRACE_PERIOD_DAYS) {
                // Still in grace period
                const graceDaysLeft = this.GRACE_PERIOD_DAYS - daysSinceExpiration;
                return {
                    calculatedStatus: 'inactive',
                    isOverdue: true,
                    daysPastDue: daysSinceExpiration,
                    nextDueDate: expirationDetails.expirationDate,
                    gracePeriodEnds,
                    shouldSuspend: false,
                    shouldCancel: false,
                    statusReason: `Expirado há ${daysSinceExpiration} dias - ${graceDaysLeft} dias restantes no período de graça`,
                    expirationDate: expirationDetails.expirationDate,
                    daysRemaining: 0,
                    isExpired: true
                };
            }
        }
        // Handle cases where payment was not successful or no payment received
        if (!hasSuccessfulPayment) {
            return {
                calculatedStatus: 'inactive',
                isOverdue: true,
                daysPastDue: 0,
                nextDueDate: null,
                gracePeriodEnds: null,
                shouldSuspend: false,
                shouldCancel: false,
                statusReason: 'Pagamento não realizado ou não aprovado',
                expirationDate: expirationDetails.expirationDate,
                daysRemaining: expirationDetails.daysRemaining,
                isExpired: expirationDetails.isExpired
            };
        }
        // Handle cases where contract is expired beyond grace period
        if (expirationDetails.isExpired && expirationDetails.expirationDate) {
            const daysSinceExpiration = Math.floor((now.getTime() - expirationDetails.expirationDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceExpiration > this.GRACE_PERIOD_DAYS && daysSinceExpiration <= this.CANCELLATION_DAYS) {
                // Suspended
                return {
                    calculatedStatus: 'suspended',
                    isOverdue: true,
                    daysPastDue: daysSinceExpiration,
                    nextDueDate: expirationDetails.expirationDate,
                    gracePeriodEnds: null,
                    shouldSuspend: true,
                    shouldCancel: false,
                    statusReason: `Suspenso - expirado há ${daysSinceExpiration} dias`,
                    expirationDate: expirationDetails.expirationDate,
                    daysRemaining: 0,
                    isExpired: true
                };
            }
            else if (daysSinceExpiration > this.CANCELLATION_DAYS) {
                // Cancelled
                return {
                    calculatedStatus: 'cancelled',
                    isOverdue: true,
                    daysPastDue: daysSinceExpiration,
                    nextDueDate: expirationDetails.expirationDate,
                    gracePeriodEnds: null,
                    shouldSuspend: false,
                    shouldCancel: true,
                    statusReason: `Cancelado - expirado há ${daysSinceExpiration} dias`,
                    expirationDate: expirationDetails.expirationDate,
                    daysRemaining: 0,
                    isExpired: true
                };
            }
        }
        // Default fallback
        return {
            calculatedStatus: 'inactive',
            isOverdue: true,
            daysPastDue: 0,
            nextDueDate: expirationDetails.expirationDate,
            gracePeriodEnds: null,
            shouldSuspend: false,
            shouldCancel: false,
            statusReason: 'Status indefinido - contate o suporte',
            expirationDate: expirationDetails.expirationDate,
            daysRemaining: expirationDetails.daysRemaining,
            isExpired: expirationDetails.isExpired
        };
    }
    /**
     * Calculate the next due date for a contract based on its billing period
     */
    static calculateNextDueDate(contract, currentDate, cycleOffset = 0) {
        // Guard against undefined startDate
        if (!contract.startDate)
            return null;
        const startDate = new Date(contract.startDate);
        const billingPeriod = contract.billingPeriod || 'monthly';
        // Ensure startDate is valid
        if (isNaN(startDate.getTime()))
            return null;
        if (billingPeriod === 'monthly') {
            return this.calculateNextMonthlyDueDate(startDate, currentDate, cycleOffset);
        }
        else if (billingPeriod === 'annual') {
            return this.calculateNextAnnualDueDate(startDate, currentDate, cycleOffset);
        }
        return null;
    }
    /**
     * Calculate next due date for monthly billing cycle
     */
    static calculateNextMonthlyDueDate(startDate, currentDate, cycleOffset = 0) {
        // Start with the current month and year
        let candidateYear = currentDate.getFullYear();
        let candidateMonth = currentDate.getMonth();
        // Clamp start day to valid range for current month (handle 29th-31st edge cases)
        const maxDaysInCurrentMonth = this.getDaysInMonth(candidateYear, candidateMonth);
        const clampedDay = Math.min(startDate.getDate(), maxDaysInCurrentMonth);
        // Create candidate due date in current month
        const candidateDueDate = new Date(candidateYear, candidateMonth, clampedDay);
        // If current date is past this month's due date, advance to next month
        if (currentDate > candidateDueDate) {
            candidateMonth += 1;
            // Handle year overflow
            if (candidateMonth >= 12) {
                candidateMonth = 0;
                candidateYear += 1;
            }
            // Clamp day again for the next month
            const maxDaysInNextMonth = this.getDaysInMonth(candidateYear, candidateMonth);
            const nextMonthDay = Math.min(startDate.getDate(), maxDaysInNextMonth);
            const nextDueDate = new Date(candidateYear, candidateMonth, nextMonthDay);
            // Apply cycle offset if needed (for future billing cycles)
            if (cycleOffset > 0) {
                nextDueDate.setMonth(nextDueDate.getMonth() + cycleOffset);
            }
            return nextDueDate;
        }
        // Current date is before this month's due date, so return current month's due date
        // Apply cycle offset if needed  
        if (cycleOffset > 0) {
            candidateDueDate.setMonth(candidateDueDate.getMonth() + cycleOffset);
        }
        return candidateDueDate;
    }
    /**
     * Calculate next due date for annual billing cycle
     */
    static calculateNextAnnualDueDate(startDate, currentDate, cycleOffset = 0) {
        // Start with current year
        let candidateYear = currentDate.getFullYear();
        let candidateMonth = startDate.getMonth();
        let candidateDay = startDate.getDate();
        // Handle leap year edge case (Feb 29th)
        if (candidateMonth === 1 && candidateDay === 29 && !this.isLeapYear(candidateYear)) {
            candidateDay = 28;
        }
        // Create anniversary date in current year
        const candidateDueDate = new Date(candidateYear, candidateMonth, candidateDay);
        // If current date > anniversary, advance to next year
        if (currentDate > candidateDueDate) {
            candidateYear += 1;
            // Handle leap year edge case again for next year
            if (candidateMonth === 1 && startDate.getDate() === 29 && !this.isLeapYear(candidateYear)) {
                candidateDay = 28;
            }
            else {
                candidateDay = startDate.getDate();
            }
            const nextDueDate = new Date(candidateYear, candidateMonth, candidateDay);
            // Apply cycle offset if needed
            if (cycleOffset > 0) {
                nextDueDate.setFullYear(nextDueDate.getFullYear() + cycleOffset);
            }
            return nextDueDate;
        }
        // Current date is before this year's anniversary, so return current year's anniversary
        // Apply cycle offset if needed
        if (cycleOffset > 0) {
            candidateDueDate.setFullYear(candidateDueDate.getFullYear() + cycleOffset);
        }
        return candidateDueDate;
    }
    /**
     * Helper to get days in a month
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    /**
     * Helper to check if a year is a leap year
     */
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    /**
     * Calculate the current period's due date (the due date for the current billing period)
     */
    static calculateCurrentPeriodDueDate(contract, currentDate) {
        // Guard against undefined startDate
        if (!contract.startDate)
            return null;
        const startDate = new Date(contract.startDate);
        const billingPeriod = contract.billingPeriod || 'monthly';
        // Ensure startDate is valid
        if (isNaN(startDate.getTime()))
            return null;
        if (billingPeriod === 'monthly') {
            return this.calculateCurrentMonthlyDueDate(startDate, currentDate);
        }
        else if (billingPeriod === 'annual') {
            return this.calculateCurrentAnnualDueDate(startDate, currentDate);
        }
        return null;
    }
    /**
     * Calculate the current monthly due date for the current billing period
     */
    static calculateCurrentMonthlyDueDate(startDate, currentDate) {
        // Start with the current month and year
        const candidateYear = currentDate.getFullYear();
        const candidateMonth = currentDate.getMonth();
        // Clamp start day to valid range for current month (handle 29th-31st edge cases)
        const maxDaysInCurrentMonth = this.getDaysInMonth(candidateYear, candidateMonth);
        const clampedDay = Math.min(startDate.getDate(), maxDaysInCurrentMonth);
        // Return the due date in the current month
        return new Date(candidateYear, candidateMonth, clampedDay);
    }
    /**
     * Calculate the current annual due date for the current billing period
     */
    static calculateCurrentAnnualDueDate(startDate, currentDate) {
        // Start with current year
        const candidateYear = currentDate.getFullYear();
        let candidateMonth = startDate.getMonth();
        let candidateDay = startDate.getDate();
        // Handle leap year edge case (Feb 29th)
        if (candidateMonth === 1 && candidateDay === 29 && !this.isLeapYear(candidateYear)) {
            candidateDay = 28;
        }
        // Return the anniversary date in the current year
        return new Date(candidateYear, candidateMonth, candidateDay);
    }
    /**
     * Calculate the last due date (most recent due date that has already passed)
     */
    static calculateLastDueDate(contract, currentDate) {
        // Guard against undefined startDate
        if (!contract.startDate)
            return null;
        const startDate = new Date(contract.startDate);
        const billingPeriod = contract.billingPeriod || 'monthly';
        // Ensure startDate is valid
        if (isNaN(startDate.getTime()))
            return null;
        if (billingPeriod === 'monthly') {
            return this.calculateLastMonthlyDueDate(startDate, currentDate);
        }
        else if (billingPeriod === 'annual') {
            return this.calculateLastAnnualDueDate(startDate, currentDate);
        }
        return null;
    }
    /**
     * Calculate the last monthly due date that has already passed
     */
    static calculateLastMonthlyDueDate(startDate, currentDate) {
        // Start with the current month and year
        let candidateYear = currentDate.getFullYear();
        let candidateMonth = currentDate.getMonth();
        // Clamp start day to valid range for current month (handle 29th-31st edge cases)
        const maxDaysInCurrentMonth = this.getDaysInMonth(candidateYear, candidateMonth);
        const clampedDay = Math.min(startDate.getDate(), maxDaysInCurrentMonth);
        // Create candidate due date in current month
        const candidateDueDate = new Date(candidateYear, candidateMonth, clampedDay);
        // If current date is before this month's due date, go back to previous month
        if (currentDate <= candidateDueDate) {
            candidateMonth -= 1;
            // Handle year underflow
            if (candidateMonth < 0) {
                candidateMonth = 11;
                candidateYear -= 1;
            }
            // Clamp day again for the previous month
            const maxDaysInPrevMonth = this.getDaysInMonth(candidateYear, candidateMonth);
            const prevMonthDay = Math.min(startDate.getDate(), maxDaysInPrevMonth);
            return new Date(candidateYear, candidateMonth, prevMonthDay);
        }
        // Current date is after this month's due date, so return this month's due date
        return candidateDueDate;
    }
    /**
     * Calculate the last annual due date that has already passed
     */
    static calculateLastAnnualDueDate(startDate, currentDate) {
        // Start with current year
        let candidateYear = currentDate.getFullYear();
        let candidateMonth = startDate.getMonth();
        let candidateDay = startDate.getDate();
        // Handle leap year edge case (Feb 29th)
        if (candidateMonth === 1 && candidateDay === 29 && !this.isLeapYear(candidateYear)) {
            candidateDay = 28;
        }
        // Create anniversary date in current year
        const candidateDueDate = new Date(candidateYear, candidateMonth, candidateDay);
        // If current date is before this year's anniversary, go back to previous year
        if (currentDate <= candidateDueDate) {
            candidateYear -= 1;
            // Handle leap year edge case again for previous year
            if (candidateMonth === 1 && startDate.getDate() === 29 && !this.isLeapYear(candidateYear)) {
                candidateDay = 28;
            }
            else {
                candidateDay = startDate.getDate();
            }
            return new Date(candidateYear, candidateMonth, candidateDay);
        }
        // Current date is after this year's anniversary, so return current year's anniversary
        return candidateDueDate;
    }
    /**
     * Check if the payment covers the current billing period
     * This replaces the old isPaymentOldForBillingCycle method
     */
    static isPaymentCurrentForBillingPeriod(contract, currentDate, lastDueDate, nextDueDate) {
        if (!contract.receivedDate || !lastDueDate || !nextDueDate)
            return false;
        const paymentDate = new Date(contract.receivedDate);
        // Payment is current if it occurred between the last due date and the next due date
        return paymentDate >= lastDueDate && paymentDate < nextDueDate;
    }
    /**
     * Check if the payment was successful based on Cielo return codes
     */
    static isPaymentSuccessful(contract) {
        if (!contract.returnCode)
            return false;
        // Cielo return codes for successful payments
        // "00" and "0" both indicate payment successful/approved
        const successCodes = ['00', '0']; // Both formats accepted for approved/paid
        return successCodes.includes(contract.returnCode);
    }
    /**
     * Check if the payment is too old for the current billing cycle
     */
    static isPaymentOldForBillingCycle(contract, currentDate) {
        if (!contract.receivedDate || !contract.startDate)
            return true;
        const paymentDate = new Date(contract.receivedDate);
        const startDate = new Date(contract.startDate);
        const billingPeriod = contract.billingPeriod || 'monthly';
        if (billingPeriod === 'monthly') {
            // Payment is old if it's more than 1 billing cycle old
            const monthsOld = (currentDate.getFullYear() - paymentDate.getFullYear()) * 12 +
                (currentDate.getMonth() - paymentDate.getMonth());
            return monthsOld > 1;
        }
        else if (billingPeriod === 'annual') {
            // Payment is old if it's more than 1 year old
            const yearsOld = currentDate.getFullYear() - paymentDate.getFullYear();
            return yearsOld > 1;
        }
        return false;
    }
    /**
     * Get user-friendly status description
     */
    static getStatusDescription(result) {
        switch (result.calculatedStatus) {
            case 'active':
                if (result.gracePeriodEnds && result.isOverdue) {
                    return `Ativo (período de graça até ${result.gracePeriodEnds.toLocaleDateString('pt-BR')})`;
                }
                return 'Ativo';
            case 'inactive':
                return `Inativo - Pagamento em atraso há ${result.daysPastDue} dias`;
            case 'suspended':
                return `Suspenso - Pagamento em atraso há ${result.daysPastDue} dias`;
            case 'cancelled':
                return `Cancelado - Pagamento em atraso há ${result.daysPastDue} dias`;
            default:
                return 'Status desconhecido';
        }
    }
    /**
     * Get payment action required message based on time-based expiration
     */
    static getActionRequired(result) {
        // If active and not expired, check if renewal is needed soon
        if (result.calculatedStatus === 'active' && !result.isExpired) {
            if (result.daysRemaining <= 5 && result.daysRemaining > 0) {
                return `Renovação necessária em ${result.daysRemaining} dias`;
            }
            return null; // No action required
        }
        // If expired but in grace period
        if (result.isExpired && result.isOverdue && result.daysPastDue <= this.GRACE_PERIOD_DAYS) {
            const daysLeft = this.GRACE_PERIOD_DAYS - result.daysPastDue;
            return `Plano expirado - ${daysLeft} dias restantes para renovação`;
        }
        // Based on status
        if (result.calculatedStatus === 'inactive') {
            if (result.isExpired) {
                return 'Plano expirado - Renovação necessária';
            }
            return 'Pagamento não realizado - Entre em contato para ativar o plano';
        }
        if (result.calculatedStatus === 'suspended') {
            return 'Plano suspenso por falta de renovação - Entre em contato';
        }
        if (result.calculatedStatus === 'cancelled') {
            return 'Plano cancelado - Entre em contato para reativação';
        }
        return null;
    }
    /**
     * Batch evaluate multiple contracts
     */
    static evaluateMultipleContracts(contracts) {
        const results = new Map();
        for (const contract of contracts) {
            results.set(contract.id, this.evaluateContractPaymentStatus(contract));
        }
        return results;
    }
}
// Configuration constants
PaymentStatusService.GRACE_PERIOD_DAYS = 15; // 15 days grace period
PaymentStatusService.SUSPENSION_DAYS = 16; // Suspend after 16 days overdue (day after grace period ends)
PaymentStatusService.CANCELLATION_DAYS = 60; // Cancel after 60 days overdue
// New time-based expiration constants
PaymentStatusService.MONTHLY_EXPIRATION_DAYS = 30; // Monthly contracts expire after 30 days
PaymentStatusService.ANNUAL_EXPIRATION_DAYS = 365; // Annual contracts expire after 365 days
