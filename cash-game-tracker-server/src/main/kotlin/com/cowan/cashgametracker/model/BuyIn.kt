package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant

class BuyIn(
    override val id: String,
    override val accountId: String,
    override val amount: BigDecimal,
    override val createTime: Instant
) : Transfer {
    override val type = Transfer.Type.BUY_IN

    fun copyWithPrecision(decimals: Int): BuyIn {
        ModelUtil.validate(amount.stripTrailingZeros().scale() <= decimals) { "Buy in had too much precision" }

        return BuyIn(id, accountId, amount.setScale(decimals, RoundingMode.UNNECESSARY), createTime)
    }
}