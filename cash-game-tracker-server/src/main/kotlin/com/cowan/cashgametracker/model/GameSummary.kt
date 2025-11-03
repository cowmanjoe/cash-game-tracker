package com.cowan.cashgametracker.model

import java.math.BigDecimal

data class GameSummary(
    val amountToReceive: BigDecimal,    // What players owe to house
    val amountToPay: BigDecimal,         // What house owes to players
    val netOutstanding: BigDecimal,      // Difference (should be $0 when balanced)
    val totalChipsInPlay: BigDecimal,    // Total buy-ins (total chips used)
    val totalCashOuts: BigDecimal,       // Total cash-outs
    val netChips: BigDecimal             // Total buy-ins - total cash-outs (should be $0)
)
