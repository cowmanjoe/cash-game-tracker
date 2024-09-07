package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

interface Transfer {
    val accountId: String
    val amount: BigDecimal
    val createTime: Instant
    val type: Type

    enum class Type {
        BUY_IN,
        CASH_OUT,
        PAYMENT
    }
}