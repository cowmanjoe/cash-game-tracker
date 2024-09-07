package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

class CashOut(
    override val accountId: String,
    override val amount: BigDecimal,
    override val createTime: Instant
) : Transfer {
    override val type = Transfer.Type.CASH_OUT
}