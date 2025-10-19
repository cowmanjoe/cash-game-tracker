package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.model.Account
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.model.PlayerNotInGameException
import com.cowan.cashgametracker.model.SettlementStatus
import com.cowan.cashgametracker.model.Transfer
import com.cowan.cashgametracker.model.ValidationException
import com.cowan.cashgametracker.repository.GameRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import java.time.Instant

private const val GAME_ID = "Game1"
private val GAME_CREATE_TIME = Instant.ofEpochSecond(1722920692)

private const val ACCOUNT_ID1 = "Account1"
private const val ACCOUNT_NAME1 = "Alice"
private const val ACCOUNT_ID2 = "Account2"
private const val ACCOUNT_NAME2 = "Bob"

class GameServiceTest {

    private val mockGameRepo = mockk<GameRepository>()
    private val mockAccountService = mockk<AccountService>()
    private val currencyAmountService = com.cowan.cashgametracker.util.CurrencyAmountService()
    private val gameService = GameService(mockGameRepo, mockAccountService, currencyAmountService)

    private val gameEntities = mutableMapOf<String, GameEntity>()
    private val gameEntity = GameEntity(GAME_CREATE_TIME, id = GAME_ID)

    private val accounts = mutableMapOf<String, Account>()

    init {
        every { mockGameRepo.getById(any()) } answers { gameEntities.getValue(firstArg()) }
        every { mockGameRepo.save(any()) } answers {
            val game = firstArg<GameEntity>()

            if (game.id == null) {
                game.id = EntityUtil.generateNewId()
            }

            game.buyIns.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }
            game.cashOuts.values.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }
            game.payments.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }

            game
        }

        gameEntities[gameEntity.id!!] = gameEntity

        every { mockAccountService.getAccount(any()) } answers { accounts.getValue(firstArg()) }

        accounts[ACCOUNT_ID1] = Account(ACCOUNT_ID1, ACCOUNT_NAME1)
        accounts[ACCOUNT_ID2] = Account(ACCOUNT_ID2, ACCOUNT_NAME2)
    }

    @Test
    fun test_createGame_newGame_returnsEmptyGame() {
        val game = gameService.createGame()

        assertEquals(0, game.buyIns.size)
        assertEquals(0, game.cashOutsByAccountId.size)
        assertEquals(0, game.payments.size)
    }

    @Test
    fun test_addBuyIn_addOneBuyIn_gameContainsOneBuyIn() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        val game = gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)

        assertEquals(1, game.buyIns.size)
        assertEquals(0, BigDecimal.TEN.compareTo(game.buyIns[0].amount))
        assertEquals(ACCOUNT_ID1, game.buyIns[0].accountId)
    }

    @Test
    fun test_addBuyIn_addMultipleBuyIns_gameContainsMultipleBuyIns() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(90))
        val game = gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(50))

        assertEquals(3, game.buyIns.size)

        val accountId1Total = game.buyIns.filter { it.accountId == ACCOUNT_ID1 }.sumOf { it.amount }
        assertEquals(0, BigDecimal(120).compareTo(accountId1Total))

        val accountId2Total = game.buyIns.filter { it.accountId == ACCOUNT_ID2 }.sumOf { it.amount }
        assertEquals(0, BigDecimal(50).compareTo(accountId2Total))
    }

    @Test
    fun test_addBuyIn_withoutPlayer_throwsException() {
        assertThrows<PlayerNotInGameException> { gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN) }
    }

    @Test
    fun test_updateCashOut_oneCashOut_gameContainsOneCashOut() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)

        assertEquals(1, game.cashOutsByAccountId.size)
        assertEquals(BigDecimal("10.00"), game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)
    }

    @Test
    fun test_updateCashOut_multipleUpdates_latestUpdatePersists() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))

        assertEquals(1, game.cashOutsByAccountId.size)
        assertEquals(BigDecimal("50.00"), game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)
    }

    @Test
    fun test_updateCashOut_withoutPlayer_throwsException() {
        assertThrows<PlayerNotInGameException> {
            gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)
        }
    }

    @Test
    fun test_updateCashOut_multipleAccounts_oneCashOutPerAccount() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(80))
        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID2, BigDecimal(35))

        assertEquals(2, game.cashOutsByAccountId.size)

        assertEquals(BigDecimal("80.00"), game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)

        assertEquals(BigDecimal("35.00"), game.cashOutsByAccountId.getValue(ACCOUNT_ID2).amount)
        assertEquals(ACCOUNT_ID2, game.cashOutsByAccountId.getValue(ACCOUNT_ID2).accountId)
    }

    @Test
    fun test_addPayment_addOnePayment_gameContainsOnePayment() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN, Payment.Side.PAYER)

        assertEquals(1, game.payments.size)
        assertEquals(0, BigDecimal.TEN.compareTo(game.payments[0].amount))
        assertEquals(ACCOUNT_ID1, game.payments[0].accountId)
    }

    @Test
    fun test_addPayment_addMultiplePayments_gameContainsMultiplePayments() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(30), Payment.Side.PAYER)
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(90), Payment.Side.PAYER)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID2, BigDecimal(50), Payment.Side.RECIPIENT)

        assertEquals(3, game.payments.size)

        val accountId1Payments = game.payments.filter { it.accountId == ACCOUNT_ID1 }
        assertEquals(0, BigDecimal(120).compareTo(accountId1Payments.sumOf { it.amount }))
        accountId1Payments.forEach { assertEquals(Payment.Side.PAYER, it.side) }

        val accountId2Payments = game.payments.filter { it.accountId == ACCOUNT_ID2 }
        assertEquals(0, BigDecimal(50).compareTo(accountId2Payments.sumOf { it.amount }))
        accountId2Payments.forEach { assertEquals(Payment.Side.RECIPIENT, it.side) }
    }

    @Test
    fun test_addPayment_withoutPlayer_throwsException() {
        assertThrows<PlayerNotInGameException> {
            gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN, Payment.Side.PAYER)
        }
    }

    @Test
    fun test_getPayment_existingPayment_returnsPayment() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.PAYER)
        val paymentId = game.payments[0].id

        val payment = gameService.getPayment(GAME_ID, paymentId)

        assertEquals(paymentId, payment.id)
        assertEquals(ACCOUNT_ID1, payment.accountId)
        assertEquals(0, BigDecimal(100).compareTo(payment.amount))
        assertEquals(Payment.Side.PAYER, payment.side)
    }

    @Test
    fun test_getPayment_nonExistentPayment_throwsValidationException() {
        assertThrows<ValidationException> {
            gameService.getPayment(GAME_ID, "nonExistentPaymentId")
        }
    }

    @Test
    fun test_updatePayment_existingPayment_updatesAmount() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.PAYER)
        val paymentId = game.payments[0].id

        val updatedGame = gameService.updatePayment(GAME_ID, paymentId, BigDecimal(150), Payment.Side.PAYER)

        assertEquals(1, updatedGame.payments.size)
        val payment = updatedGame.payments.single { it.id == paymentId }
        assertEquals(0, BigDecimal(150).compareTo(payment.amount))
        assertEquals(ACCOUNT_ID1, payment.accountId)
        assertEquals(Payment.Side.PAYER, payment.side)
    }

    @Test
    fun test_updatePayment_multipleUpdates_latestUpdatePersists() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.PAYER)
        val paymentId = game.payments[0].id

        gameService.updatePayment(GAME_ID, paymentId, BigDecimal(150), Payment.Side.PAYER)
        gameService.updatePayment(GAME_ID, paymentId, BigDecimal(200), Payment.Side.PAYER)
        val finalGame = gameService.updatePayment(GAME_ID, paymentId, BigDecimal(250), Payment.Side.RECIPIENT)

        assertEquals(1, finalGame.payments.size)
        val payment = finalGame.payments.single { it.id == paymentId }
        assertEquals(0, BigDecimal(250).compareTo(payment.amount))
    }

    @Test
    fun test_updatePayment_nonExistentPayment_throwsValidationException() {
        assertThrows<ValidationException> {
            gameService.updatePayment(GAME_ID, "nonExistentPaymentId", BigDecimal(100), Payment.Side.PAYER)
        }
    }

    @Test
    fun test_updatePayment_canChangeSide() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.RECIPIENT)
        val paymentId = game.payments[0].id

        val updatedGame = gameService.updatePayment(GAME_ID, paymentId, BigDecimal(200), Payment.Side.PAYER)

        val payment = updatedGame.payments.single { it.id == paymentId }
        assertEquals(ACCOUNT_ID1, payment.accountId)
        assertEquals(Payment.Side.PAYER, payment.side)
        assertEquals(0, BigDecimal(200).compareTo(payment.amount))
    }

    @Test
    fun test_deletePayment_existingPayment_removesPayment() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.PAYER)
        val paymentId = game.payments[0].id

        val updatedGame = gameService.deletePayment(GAME_ID, paymentId)

        assertEquals(0, updatedGame.payments.size)
    }

    @Test
    fun test_deletePayment_nonExistentPayment_throwsValidationException() {
        assertThrows<ValidationException> {
            gameService.deletePayment(GAME_ID, "nonExistentPaymentId")
        }
    }

    @Test
    fun test_deletePayment_withMultiplePayments_removesOnlySpecified() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(100), Payment.Side.PAYER)
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID2, BigDecimal(50), Payment.Side.RECIPIENT)
        val payment1Id = game.payments.first { it.accountId == ACCOUNT_ID1 }.id
        val payment2Id = game.payments.first { it.accountId == ACCOUNT_ID2 }.id

        val updatedGame = gameService.deletePayment(GAME_ID, payment1Id)

        assertEquals(1, updatedGame.payments.size)
        assertEquals(payment2Id, updatedGame.payments[0].id)
        assertEquals(ACCOUNT_ID2, updatedGame.payments[0].accountId)
        assertEquals(0, BigDecimal(50).compareTo(updatedGame.payments[0].amount))
    }

    @Test
    fun test_addPlayer_addOnePlayer_gameContainsOnePlayer() {
        val game = gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        assertEquals(1, game.players.size)
        assertTrue(game.players.contains(ACCOUNT_ID1))
    }

    @Test
    fun test_addPlayer_addSomeDuplicatePlayers_gameContainsUniquePlayers() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)
        val game = gameService.addPlayer(GAME_ID, ACCOUNT_ID1)

        assertEquals(2, game.players.size)
        assertTrue(game.players.contains(ACCOUNT_ID1))
        assertTrue(game.players.contains(ACCOUNT_ID2))
    }

    @Test
    fun test_getBalances_emptyGame_returnsEmptyMap() {
        val balances = gameService.getBalances(GAME_ID)

        assertEquals(0, balances.size)
    }

    @Test
    fun test_getBalances_noTransactions_returnsZeroBalances() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        val balances = gameService.getBalances(GAME_ID)

        assertEquals(2, balances.size)
        assertTrue(balances.all { it.chipBalance.compareTo(BigDecimal.ZERO) == 0 })
    }

    @Test
    fun test_getBalances_withBuyIns_returnsCorrectAmounts() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(40))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(90))

        val balances = gameService.getBalances(GAME_ID)

        assertEquals(2, balances.size)
        assertEquals(0, balances.single { it.accountId == ACCOUNT_ID1 }.chipBalance.compareTo(BigDecimal(-70)))
        assertEquals(0, balances.single { it.accountId == ACCOUNT_ID2 }.chipBalance.compareTo(BigDecimal(-90)))
    }

    @Test
    fun test_getBalances_withBuyInsAndCashOuts_returnsCorrectAmounts() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(40))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(90))

        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(10))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID2, BigDecimal(150))

        val balances = gameService.getBalances(GAME_ID)

        assertEquals(2, balances.size)
        assertEquals(0, balances.single { it.accountId == ACCOUNT_ID1 }.chipBalance.compareTo(BigDecimal(-60)))
        assertEquals(0, balances.single { it.accountId == ACCOUNT_ID2 }.chipBalance.compareTo(BigDecimal(60)))
    }

    @Test
    fun test_getBalances_loserWithNoPayment_showsUnsettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(-50))) // Lost $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal.ZERO)) // No payments
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(-50))) // Still owes $50
        assertEquals(SettlementStatus.UNSETTLED, balance.status)
    }

    @Test
    fun test_getBalances_loserWithFullPayment_showsSettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(50), Payment.Side.PAYER)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(-50))) // Lost $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(50))) // Paid $50
        assertEquals(0, balance.outstanding.compareTo(BigDecimal.ZERO)) // Settled
        assertEquals(SettlementStatus.SETTLED, balance.status)
    }

    @Test
    fun test_getBalances_loserWithPartialPayment_showsUnsettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(30), Payment.Side.PAYER)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(-50))) // Lost $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(30))) // Paid $30
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(-20))) // Still owes $20
        assertEquals(SettlementStatus.UNSETTLED, balance.status)
    }

    @Test
    fun test_getBalances_loserWithOverpayment_showsOverpaid() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(60), Payment.Side.PAYER)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(-50))) // Lost $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(60))) // Paid $60
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(10))) // Overpaid by $10
        assertEquals(SettlementStatus.OVERPAID, balance.status)
    }

    @Test
    fun test_getBalances_winnerWithNoPayment_showsUnsettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(100))

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(50))) // Won $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal.ZERO)) // No payments
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(50))) // Owed $50
        assertEquals(SettlementStatus.UNSETTLED, balance.status)
    }

    @Test
    fun test_getBalances_winnerWithFullPayment_showsSettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(50), Payment.Side.RECIPIENT)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(50))) // Won $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(-50))) // Received $50
        assertEquals(0, balance.outstanding.compareTo(BigDecimal.ZERO)) // Settled
        assertEquals(SettlementStatus.SETTLED, balance.status)
    }

    @Test
    fun test_getBalances_winnerWithPartialPayment_showsUnsettled() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(30), Payment.Side.RECIPIENT)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(50))) // Won $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(-30))) // Received $30
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(20))) // Still owed $20
        assertEquals(SettlementStatus.UNSETTLED, balance.status)
    }

    @Test
    fun test_getBalances_winnerWithOverpayment_showsOverpaid() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(60), Payment.Side.RECIPIENT)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(50))) // Won $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(-60))) // Received $60
        assertEquals(0, balance.outstanding.compareTo(BigDecimal(-10))) // Received $10 too much
        assertEquals(SettlementStatus.OVERPAID, balance.status)
    }

    @Test
    fun test_getBalances_multiplePayments_calculatesCorrectly() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(100))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(20), Payment.Side.PAYER)
        gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal(30), Payment.Side.PAYER)

        val balances = gameService.getBalances(GAME_ID)
        val balance = balances.single { it.accountId == ACCOUNT_ID1 }

        assertEquals(0, balance.chipBalance.compareTo(BigDecimal(-50))) // Lost $50
        assertEquals(0, balance.paymentBalance.compareTo(BigDecimal(50))) // Paid $20 + $30 = $50
        assertEquals(0, balance.outstanding.compareTo(BigDecimal.ZERO)) // Settled
        assertEquals(SettlementStatus.SETTLED, balance.status)
    }

    @Test
    fun test_getTransfers_withNoTransfers_returnsEmptyList() {
        val transfers = gameService.getTransfers(GAME_ID)

        assertTrue(transfers.isEmpty())
    }

    @Test
    fun test_getTransfers_withBuyIns_returnsBuyIns() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(40))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(90))

        val transfers = gameService.getTransfers(GAME_ID)

        assertEquals(3, transfers.size)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID1, BigDecimal(30), transfers)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID1, BigDecimal(40), transfers)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID2, BigDecimal(90), transfers)
    }

    @Test
    fun test_getTransfers_withBuyInsAndCashOuts_returnsBuyInsAndCashOuts() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(40))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(90))

        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(10))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID2, BigDecimal(150))

        val transfers = gameService.getTransfers(GAME_ID)

        assertEquals(5, transfers.size)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID1, BigDecimal(30), transfers)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID1, BigDecimal(40), transfers)
        assertContainsTransfer(Transfer.Type.BUY_IN, ACCOUNT_ID2, BigDecimal(90), transfers)
        assertContainsTransfer(Transfer.Type.CASH_OUT, ACCOUNT_ID1, BigDecimal(10), transfers)
        assertContainsTransfer(Transfer.Type.CASH_OUT, ACCOUNT_ID2, BigDecimal(150), transfers)
    }

    @Test
    fun test_getTransfers_withCashOutNegated_returnsNoCashOut() {
        gameService.addPlayer(GAME_ID, ACCOUNT_ID1)
        gameService.addPlayer(GAME_ID, ACCOUNT_ID2)

        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal(40))
        gameService.addBuyIn(GAME_ID, ACCOUNT_ID2, BigDecimal(90))

        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(10))
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.ZERO)

        val transfers = gameService.getTransfers(GAME_ID)

        assertEquals(3, transfers.size)
        assertTrue(transfers.all { it.type == Transfer.Type.BUY_IN })
    }

    private fun assertContainsTransfer(
        expectedType: Transfer.Type,
        expectedAccountId: String,
        expectedAmount: BigDecimal,
        transfers: List<Transfer>
    ) {
        assertTrue(transfers.any { transfer ->
            expectedType == transfer.type &&
                    expectedAccountId == transfer.accountId &&
                    0 == expectedAmount.compareTo(transfer.amount)
        })
    }
}