package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.BuyInEntity
import com.cowan.cashgametracker.entity.CashOutEntity
import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.entity.PaymentEntity
import com.cowan.cashgametracker.model.BuyIn
import com.cowan.cashgametracker.model.CashOut
import com.cowan.cashgametracker.model.Game
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.repository.GameRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant

@Component
class GameService(private val gameRepo: GameRepository) {

    fun getGame(id: String): Game {
        val gameEntity = gameRepo.getById(id)

        return convertEntity(gameEntity)
    }

    @Transactional
    fun createGame(): Game {
        val gameEntity = GameEntity(Instant.now())

        gameRepo.save(gameEntity)

        val game = Game(EntityUtil.requireNotNullId(gameEntity.id), gameEntity.createTime)

        return game
    }

    @Transactional
    fun addBuyIn(gameId: String, accountId: String, amount: BigDecimal): Game {
        val gameEntity = gameRepo.getById(gameId)
        val buyInEntity = BuyInEntity(accountId, amount, Instant.now())

        gameEntity.buyIns.add(buyInEntity)

        gameRepo.save(gameEntity)

        return convertEntity(gameEntity)
    }

    @Transactional
    fun updateCashOut(gameId: String, accountId: String, amount: BigDecimal): Game {
        val gameEntity = gameRepo.getById(gameId)

        val cashOutEntity = gameEntity.cashOuts[accountId] ?: CashOutEntity(accountId, amount, Instant.now())

        cashOutEntity.amount = amount

        gameEntity.cashOuts[cashOutEntity.accountId] = cashOutEntity

        gameRepo.save(gameEntity)

        return convertEntity(gameEntity)
    }

    @Transactional
    fun addPayment(gameId: String, accountId: String, amount: BigDecimal, side: Payment.Side): Game {
        val gameEntity = gameRepo.getById(gameId)
        val paymentEntity = PaymentEntity(accountId, amount, Instant.now(), side)

        gameEntity.payments.add(paymentEntity)

        gameRepo.save(gameEntity)

        return convertEntity(gameEntity)
    }

    private fun convertEntity(buyInEntity: BuyInEntity): BuyIn {
        return BuyIn(
            EntityUtil.requireNotNullId(buyInEntity.id),
            buyInEntity.accountId,
            buyInEntity.amount,
            buyInEntity.createTime
        )
    }

    private fun convertEntity(gameEntity: GameEntity): Game {
        val game = Game(
            EntityUtil.requireNotNullId(gameEntity.id),
            gameEntity.createTime
        )

        gameEntity.buyIns.map { convertEntity(it) }.forEach { game.addBuyIn(it) }
        gameEntity.cashOuts.values.map { convertEntity(it) }.forEach { game.applyCashOut(it) }
        gameEntity.payments.map { convertEntity(it) }.forEach { game.addPayment(it) }
        return game
    }

    private fun convertEntity(cashOutEntity: CashOutEntity): CashOut {
        return CashOut(
            cashOutEntity.accountId,
            cashOutEntity.amount,
            cashOutEntity.createTime
        )
    }

    private fun convertEntity(paymentEntity: PaymentEntity): Payment {
        return Payment(
            EntityUtil.requireNotNullId(paymentEntity.id),
            paymentEntity.accountId,
            paymentEntity.amount,
            paymentEntity.createTime,
            paymentEntity.side
        )
    }
}