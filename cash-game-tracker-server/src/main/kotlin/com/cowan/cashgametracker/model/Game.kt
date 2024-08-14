package com.cowan.cashgametracker.model

import java.time.Instant

class Game(val id: String, val createTime: Instant) {

    private val mutableBuyIns = mutableListOf<BuyIn>()
    private val mutableCashOuts = mutableMapOf<String, CashOut>()
    private val mutablePayments = mutableListOf<Payment>()
    private val mutablePlayers = mutableMapOf<String, Account>()

    val buyIns get() = mutableBuyIns.sortedByDescending { it.createTime }
    val cashOutsByAccountId get() = mutableCashOuts
    val payments get() = mutablePayments.sortedByDescending { it.createTime }
    val players get() = mutablePlayers

    fun addBuyIn(buyIn: BuyIn) {
        requirePlayerInGame(buyIn.accountId)

        mutableBuyIns.add(buyIn)
    }

    fun applyCashOut(cashOut: CashOut) {
        requirePlayerInGame(cashOut.accountId)

        mutableCashOuts[cashOut.accountId] = cashOut
    }

    fun addPayment(payment: Payment) {
        requirePlayerInGame(payment.accountId)

        mutablePayments.add(payment)
    }

    fun addPlayer(player: Account) {
        mutablePlayers[player.id] = player
    }

    private fun requirePlayerInGame(accountId: String) {
        if (accountId !in players) {
            throw PlayerNotInGameException(accountId)
        }
    }
}

class PlayerNotInGameException(accountId: String) :
    RuntimeException("Player with accountId $accountId is not in the game")