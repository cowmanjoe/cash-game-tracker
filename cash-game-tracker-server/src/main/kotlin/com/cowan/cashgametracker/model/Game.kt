package com.cowan.cashgametracker.model

import java.time.Instant

class Game(val id: String, val createTime: Instant, val decimals: Int) {

    private val mutableBuyIns = mutableListOf<BuyIn>()
    private val mutableCashOuts = mutableMapOf<String, CashOut>()
    private val mutablePayments = mutableListOf<Payment>()
    private val mutablePlayers = mutableMapOf<String, Account>()

    val buyIns get() = mutableBuyIns.sortedByDescending { it.createTime }
    val cashOutsByAccountId get() = mutableCashOuts
    val payments get() = mutablePayments.sortedByDescending { it.createTime }
    val players get() = mutablePlayers

    fun addBuyIn(buyIn: BuyIn) {
        validatePlayerInGame(buyIn.accountId)

        mutableBuyIns.add(buyIn.copyWithPrecision(decimals))
    }

    fun applyCashOut(cashOut: CashOut) {
        validatePlayerInGame(cashOut.accountId)

        mutableCashOuts[cashOut.accountId] = cashOut
    }

    fun addPayment(payment: Payment) {
        validatePlayerInGame(payment.accountId)

        mutablePayments.add(payment)
    }

    fun addPlayer(player: Account) {
        mutablePlayers[player.id] = player
    }

    private fun validatePlayerInGame(accountId: String) {
        if (accountId !in players) {
            throw PlayerNotInGameException(accountId)
        }
    }
}


class PlayerNotInGameException(accountId: String) :
    ValidationException("Player with accountId $accountId is not in the game")
