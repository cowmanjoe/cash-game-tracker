package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

class Payment(
    val id: String,
    val accountId: String,
    val amount: BigDecimal,
    val createTime: Instant,
    val side: Side
) {
    enum class Side {
        PAYER,
        RECIPIENT
    }
}