package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.BuyIn
import com.cowan.cashgametracker.model.CashOut
import com.cowan.cashgametracker.model.Game
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.service.GameService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal

@RestController
@RequestMapping("game")
class GameController(private val gameService: GameService) : BaseController() {

    @GetMapping("{id}")
    fun getGame(@PathVariable("id") id: String): GameResponse {
        return GameResponse.fromGame(gameService.getGame(id))
    }

    @PostMapping
    fun createGame(): GameResponse {
        return GameResponse.fromGame(gameService.createGame())
    }

    @PostMapping("{id}/buy-in")
    fun addBuyIn(@PathVariable("id") gameId: String, @RequestBody request: AddBuyInRequest): GameResponse {
        return GameResponse.fromGame(gameService.addBuyIn(gameId, request.accountId, BigDecimal(request.amount)))
    }

    @PutMapping("{id}/cash-out")
    fun updateCashOut(@PathVariable("id") gameId: String, @RequestBody request: UpdateCashOutRequest): GameResponse {
        return GameResponse.fromGame(gameService.updateCashOut(gameId, request.accountId, BigDecimal(request.amount)))
    }

    @PostMapping("{id}/payment")
    fun addPayment(@PathVariable("id") gameId: String, @RequestBody request: AddPaymentRequest): GameResponse {
        return GameResponse.fromGame(
            gameService.addPayment(gameId, request.accountId, BigDecimal(request.amount), request.side)
        )
    }
}

data class GameResponse(
    val id: String,
    val createTime: Long,
    val buyIns: List<BuyInResponse>,
    val cashOuts: Map<String, CashOutResponse>,
    val payments: List<PaymentResponse>
) {

    companion object {
        fun fromGame(game: Game): GameResponse {
            return GameResponse(
                game.id,
                game.createTime.toEpochMilli(),
                game.buyIns.map(BuyInResponse::fromBuyIn),
                game.cashOutsByAccountId.mapValues { (_, cashOut) -> CashOutResponse.fromCashOut(cashOut) },
                game.payments.map(PaymentResponse::fromPayment)
            )
        }
    }
}

data class BuyInResponse(val id: String, val accountId: String, val amount: String, val time: Long) {
    companion object {
        fun fromBuyIn(buyIn: BuyIn): BuyInResponse {
            return BuyInResponse(
                buyIn.id,
                buyIn.accountId,
                buyIn.amount.toPlainString(),
                buyIn.createTime.toEpochMilli()
            )
        }
    }
}

data class AddBuyInRequest(val accountId: String, val amount: String)

data class UpdateCashOutRequest(val accountId: String, val amount: String)

data class CashOutResponse(val amount: String, val time: Long) {
    companion object {
        fun fromCashOut(cashOut: CashOut): CashOutResponse {
            return CashOutResponse(cashOut.amount.toPlainString(), cashOut.createTime.toEpochMilli())
        }
    }
}

data class AddPaymentRequest(val accountId: String, val amount: String, val side: Payment.Side)

data class PaymentResponse(
    val id: String,
    val accountId: String,
    val amount: String,
    val time: Long,
    val side: String
) {
    companion object {
        fun fromPayment(payment: Payment): PaymentResponse {
            return PaymentResponse(
                payment.id,
                payment.accountId,
                payment.amount.toPlainString(),
                payment.createTime.toEpochMilli(),
                payment.side.toString()
            )
        }
    }
}