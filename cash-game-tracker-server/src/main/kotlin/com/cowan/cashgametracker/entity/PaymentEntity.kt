package com.cowan.cashgametracker.entity

import com.cowan.cashgametracker.model.Payment
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal
import java.time.Instant

@Table("PAYMENT")
data class PaymentEntity(
    val accountId: String,
    val amount: BigDecimal,
    val createTime: Instant,
    val side: Payment.Side,
    @Id var id: String? = null
)