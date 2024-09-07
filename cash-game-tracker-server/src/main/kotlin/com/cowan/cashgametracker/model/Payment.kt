package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

class Payment(
    val id: String,
    override val accountId: String,
    override val amount: BigDecimal,
    override val createTime: Instant,
    val side: Side
) : Transfer {
    override val type = Transfer.Type.PAYMENT

    enum class Side {
        PAYER,
        RECIPIENT
    }
}