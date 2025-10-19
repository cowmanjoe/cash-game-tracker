package com.cowan.cashgametracker.model

import java.math.BigDecimal

class Balance(
    val accountId: String,
    val name: String,
    val chipBalance: BigDecimal,
    val paymentBalance: BigDecimal,
    val outstanding: BigDecimal,
    val status: SettlementStatus
)

enum class SettlementStatus {
    SETTLED,      // |outstanding| < $0.01
    UNSETTLED,    // Not fully paid
    OVERPAID      // Paid more than owed (warning)
}