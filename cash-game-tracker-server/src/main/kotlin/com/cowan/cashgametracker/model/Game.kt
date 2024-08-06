package com.cowan.cashgametracker.model

import java.time.Instant

class Game(val id: String, val createTime: Instant) {

    private val mutableBuyIns = mutableListOf<BuyIn>()

    val buyIns: List<BuyIn> get() = mutableBuyIns.sortedByDescending { it.createTime }

    fun addBuyIn(buyIn: BuyIn) {
        mutableBuyIns.add(buyIn)
    }
}