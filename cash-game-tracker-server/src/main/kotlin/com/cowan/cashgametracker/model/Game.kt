package com.cowan.cashgametracker.model

import java.math.BigDecimal
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

    fun getBalances(): List<Balance> {
        return players.keys.map { accountId ->
            val buyInTotal = buyIns.filter { it.accountId == accountId }.sumOf { it.amount }
            val cashOutAmount = cashOutsByAccountId[accountId]?.amount ?: BigDecimal.ZERO
            val chipBalance = cashOutAmount - buyInTotal

            // Calculate payment balance (payments reduce outstanding balance)
            // PAYER: money paid out (reduces debt, so positive in payment balance)
            // RECIPIENT: money received (reduces what's owed to you, so negative in payment balance)
            val userPayments = payments.filter { it.accountId == accountId }
            val paidOut = userPayments.filter { it.side == Payment.Side.PAYER }.sumOf { it.amount }
            val received = userPayments.filter { it.side == Payment.Side.RECIPIENT }.sumOf { it.amount }
            val paymentBalance = paidOut - received

            // Calculate outstanding and status
            val outstanding = chipBalance + paymentBalance
            val status = determineSettlementStatus(chipBalance, outstanding)

            Balance(
                accountId,
                players.getValue(accountId).name,
                chipBalance,
                paymentBalance,
                outstanding,
                status
            )
        }
    }

    private fun determineSettlementStatus(
        chipBalance: BigDecimal,
        outstanding: BigDecimal
    ): SettlementStatus {
        val threshold = BigDecimal("0.01")

        return when {
            outstanding.abs() < threshold -> SettlementStatus.SETTLED

            // Overpaid: owed money but outstanding is positive, or had debt but outstanding is negative
            (chipBalance < BigDecimal.ZERO && outstanding > BigDecimal.ZERO) ||
            (chipBalance > BigDecimal.ZERO && outstanding < BigDecimal.ZERO) ->
                SettlementStatus.OVERPAID

            // Everything else is unsettled
            else -> SettlementStatus.UNSETTLED
        }
    }

    fun getTransfers(): List<Transfer> {
        val transfers: List<Transfer> = buyIns + cashOutsByAccountId.values + payments

        return transfers.filter { it.amount.compareTo(BigDecimal.ZERO) != 0 }.sortedByDescending { it.createTime }
    }

    private fun validatePlayerInGame(accountId: String) {
        if (accountId !in players) {
            throw PlayerNotInGameException(accountId)
        }
    }
}


class PlayerNotInGameException(accountId: String) :
    ValidationException("Player with accountId $accountId is not in the game")
