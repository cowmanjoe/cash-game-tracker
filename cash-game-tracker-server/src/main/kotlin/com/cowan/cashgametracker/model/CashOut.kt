package com.cowan.cashgametracker.model

import java.math.BigDecimal
import java.time.Instant

class CashOut(val accountId: String, val amount: BigDecimal, val createTime: Instant)