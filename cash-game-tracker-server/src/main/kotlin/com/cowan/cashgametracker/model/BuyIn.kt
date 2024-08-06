package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

class BuyIn(val id: String, val accountId: String, val amount: BigDecimal, val createTime: Instant)