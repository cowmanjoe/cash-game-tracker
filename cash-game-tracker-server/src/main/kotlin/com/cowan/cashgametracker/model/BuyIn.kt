package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant

class BuyIn(val id: String, val accountId: String, val amount: BigDecimal, val createTime: Instant) {
    fun copyWithPrecision(decimals: Int): BuyIn {
        ModelUtil.validate(amount.stripTrailingZeros().scale() <= decimals) { "Buy in had too much precision" }

        return BuyIn(id, accountId, amount.setScale(decimals, RoundingMode.UNNECESSARY), createTime)
    }
}