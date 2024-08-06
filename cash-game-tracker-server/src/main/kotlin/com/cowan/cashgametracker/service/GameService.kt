package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.BuyInEntity
import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.model.BuyIn
import com.cowan.cashgametracker.model.Game
import com.cowan.cashgametracker.repository.GameRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Component
class GameService(private val gameRepo: GameRepository) {

    fun getGame(id: String): Game {
        val gameEntity = gameRepo.getById(id)

        val game = Game(
            EntityUtil.requireNotNullId(gameEntity.id),
            gameEntity.createTime
        )

        gameEntity.buyIns.map { entityToBuyIn(it) }.forEach { game.addBuyIn(it) }

        return game
    }

    @Transactional
    fun createGame(): Game {
        val gameEntity = GameEntity(Instant.now(), mutableSetOf())

        gameRepo.save(gameEntity)

        val game = Game(EntityUtil.requireNotNullId(gameEntity.id), gameEntity.createTime)

        return game
    }

    private fun entityToBuyIn(buyInEntity: BuyInEntity): BuyIn {
        return BuyIn(EntityUtil.requireNotNullId(buyInEntity.id), buyInEntity.accountId, buyInEntity.amount)
    }
}