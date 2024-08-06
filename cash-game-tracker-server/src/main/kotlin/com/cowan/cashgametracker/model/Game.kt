package com.cowan.cashgametracker.model

import java.time.Instant

class Game(val id: String, val createTime: Instant) {

    private val mutableBuyIns = mutableListOf<BuyIn>()
    private val mutableCashOuts = mutableMapOf<String, CashOut>()

    val buyIns: List<BuyIn> get() = mutableBuyIns.sortedByDescending { it.createTime }
    val cashOutsByAccountId = mutableCashOuts

    fun addBuyIn(buyIn: BuyIn) {
        mutableBuyIns.add(buyIn)
    }

    fun applyCashOut(cashOut: CashOut) {
        mutableCashOuts[cashOut.accountId] = cashOut
    }
}