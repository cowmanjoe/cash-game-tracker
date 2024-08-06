package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.repository.GameRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant

private const val GAME_ID = "Game1"
private val GAME_CREATE_TIME = Instant.ofEpochSecond(1722920692)

private const val ACCOUNT_ID = "Account1"

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

            game.payments.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }

            game
        }

        gameEntities[gameEntity.id!!] = gameEntity
    }

    @Test
    fun test_addPayment_addOnePayment_gameContainsOnePayment() {
        val game = gameService.addPayment(GAME_ID, ACCOUNT_ID, BigDecimal.TEN, Payment.Side.PAYER)

        Assertions.assertEquals(1, game.payments.size)
    }
}