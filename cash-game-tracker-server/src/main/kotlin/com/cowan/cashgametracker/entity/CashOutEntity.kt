package com.cowan.cashgametracker.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal
import java.time.Instant

@Table("CASH_OUT")
data class CashOutEntity(
    val accountId: String,
    var amount: BigDecimal,
    val createTime: Instant,
    @Id var id: String? = null
)