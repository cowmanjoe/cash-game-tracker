package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.repository.GameRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant

private const val GAME_ID = "Game1"
private val GAME_CREATE_TIME = Instant.ofEpochSecond(1722920692)

private const val ACCOUNT_ID1 = "Account1"
private const val ACCOUNT_ID2 = "Account2"

class GameServiceTest {

    private val mockGameRepo = mockk<GameRepository>()
    private val gameService = GameService(mockGameRepo)

    private val gameEntities = mutableMapOf<String, GameEntity>()
    private val gameEntity = GameEntity(GAME_CREATE_TIME, id = GAME_ID)

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
        val game = gameService.addBuyIn(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)

        assertEquals(1, game.buyIns.size)
        assertEquals(0, BigDecimal.TEN.compareTo(game.buyIns[0].amount))
        assertEquals(ACCOUNT_ID1, game.buyIns[0].accountId)
    }

    @Test
    fun test_addBuyIn_addMultipleBuyIns_gameContainsMultipleBuyIns() {
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
    fun test_updateCashOut_oneCashOut_gameContainsOneCashOut() {
        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)

        assertEquals(1, game.cashOutsByAccountId.size)
        assertEquals(BigDecimal.TEN, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)
    }

    @Test
    fun test_updateCashOut_multipleUpdates_latestUpdatePersists() {
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(30))
        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(50))

        assertEquals(1, game.cashOutsByAccountId.size)
        assertEquals(BigDecimal(50), game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)
    }

    @Test
    fun test_updateCashOut_multipleAccounts_oneCashOutPerAccount() {
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN)
        gameService.updateCashOut(GAME_ID, ACCOUNT_ID1, BigDecimal(80))
        val game = gameService.updateCashOut(GAME_ID, ACCOUNT_ID2, BigDecimal(35))

        assertEquals(2, game.cashOutsByAccountId.size)

        assertEquals(BigDecimal(80), game.cashOutsByAccountId.getValue(ACCOUNT_ID1).amount)
        assertEquals(ACCOUNT_ID1, game.cashOutsByAccountId.getValue(ACCOUNT_ID1).accountId)

        assertEquals(BigDecimal(35), game.cashOutsByAccountId.getValue(ACCOUNT_ID2).amount)
        assertEquals(ACCOUNT_ID2, game.cashOutsByAccountId.getValue(ACCOUNT_ID2).accountId)
    }

    @Test
    fun test_addPayment_addOnePayment_gameContainsOnePayment() {
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID1, BigDecimal.TEN, Payment.Side.PAYER)

        assertEquals(1, game.payments.size)
        assertEquals(0, BigDecimal.TEN.compareTo(game.payments[0].amount))
        assertEquals(ACCOUNT_ID1, game.payments[0].accountId)
    }

    @Test
    fun test_addPayment_addMultiplePayments_gameContainsMultiplePayments() {
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
}