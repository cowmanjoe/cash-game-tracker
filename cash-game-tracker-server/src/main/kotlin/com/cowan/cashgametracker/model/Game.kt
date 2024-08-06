package com.cowan.cashgametracker.model

import java.time.Instant

class Game(val id: String, val createTime: Instant) {

    private val mutableBuyIns = mutableListOf<BuyIn>()
    private val mutableCashOuts = mutableMapOf<String, CashOut>()
    private val mutablePayments = mutableListOf<Payment>()

    val buyIns: List<BuyIn> get() = mutableBuyIns.sortedByDescending { it.createTime }
    val cashOutsByAccountId get() = mutableCashOuts
    val payments get() = mutablePayments.sortedByDescending { it.createTime }

    fun addBuyIn(buyIn: BuyIn) {
        mutableBuyIns.add(buyIn)
    }

    fun applyCashOut(cashOut: CashOut) {
        mutableCashOuts[cashOut.accountId] = cashOut
    }

    fun addPayment(payment: Payment) {
        mutablePayments.add(payment)
    }
}