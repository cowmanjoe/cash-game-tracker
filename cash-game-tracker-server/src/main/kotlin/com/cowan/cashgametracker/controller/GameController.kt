package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.Balance
import com.cowan.cashgametracker.model.BuyIn
import com.cowan.cashgametracker.model.CashOut
import com.cowan.cashgametracker.model.Game
import com.cowan.cashgametracker.model.Payment
import com.cowan.cashgametracker.model.Transfer
import com.cowan.cashgametracker.service.GameService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("game")
class GameController(private val gameService: GameService) : BaseController() {

    @GetMapping("{id}")
    fun getGame(@PathVariable("id") id: String): ServerResponse<GameResponse> {
        return SuccessServerResponse(GameResponse.fromGame(gameService.getGame(id)))
    }

    @PostMapping
    fun createGame(): ServerResponse<GameResponse> {
        return SuccessServerResponse(GameResponse.fromGame(gameService.createGame()))
    }

    @PostMapping("{id}/buy-in")
    fun addBuyIn(
        @PathVariable("id") gameId: String,
        @RequestBody request: AddBuyInRequest
    ): ServerResponse<GameResponse> {
        return SuccessServerResponse(
            GameResponse.fromGame(
                gameService.addBuyIn(
                    gameId,
                    request.accountId,
                    DataTranslator.toBigDecimal(request.amount)
                )
            )
        )
    }

    @PutMapping("{id}/cash-out")
    fun updateCashOut(
        @PathVariable("id") gameId: String,
        @RequestBody request: UpdateCashOutRequest
    ): ServerResponse<GameResponse> {
        return SuccessServerResponse(
            GameResponse.fromGame(
                gameService.updateCashOut(
                    gameId,
                    request.accountId,
                    DataTranslator.toBigDecimal(request.amount)
                )
            )
        )
    }

    @PostMapping("{id}/payment")
    fun addPayment(
        @PathVariable("id") gameId: String,
        @RequestBody request: AddPaymentRequest
    ): ServerResponse<GameResponse> {
        return SuccessServerResponse(
            GameResponse.fromGame(
                gameService.addPayment(
                    gameId,
                    request.accountId,
                    DataTranslator.toBigDecimal(request.amount),
                    request.side
                )
            )
        )
    }

    @PostMapping("{id}/add-player/{playerId}")
    fun addPlayer(
        @PathVariable("id") gameId: String,
        @PathVariable("playerId") playerId: String
    ): ServerResponse<GameResponse> {
        return SuccessServerResponse(GameResponse.fromGame(gameService.addPlayer(gameId, playerId)))
    }

    @PutMapping("{id}/buy-in/{buyInId}")
    fun updateBuyIn(
        @PathVariable("id") gameId: String,
        @PathVariable("buyInId") buyInId: String,
        @RequestBody request: UpdateBuyInRequest
    ): ServerResponse<GameResponse> {
        return SuccessServerResponse(
            GameResponse.fromGame(
                gameService.updateBuyIn(
                    gameId,
                    buyInId,
                    DataTranslator.toBigDecimal(request.amount)
                )
            )
        )
    }

    @GetMapping("{id}/balances")
    fun getBalances(@PathVariable("id") gameId: String): ServerResponse<BalancesResponse> {
        return SuccessServerResponse(BalancesResponse.fromBalances(gameService.getBalances(gameId)))
    }

    @GetMapping("{id}/transfers")
    fun getTransfers(@PathVariable("id") gameId: String): ServerResponse<TransfersResponse> {
        return SuccessServerResponse(TransfersResponse.fromTransfers(gameService.getTransfers(gameId)))
    }
}

data class GameResponse(
    val id: String,
    val createTime: Long,
    val buyIns: List<BuyInResponse>,
    val cashOuts: Map<String, CashOutResponse>,
    val payments: List<PaymentResponse>,
    val players: Map<String, AccountResponse>
) {

    companion object {
        fun fromGame(game: Game): GameResponse {
            return GameResponse(
                game.id,
                game.createTime.toEpochMilli(),
                game.buyIns.map(BuyInResponse::fromBuyIn),
                game.cashOutsByAccountId.mapValues { (_, cashOut) -> CashOutResponse.fromCashOut(cashOut) },
                game.payments.map(PaymentResponse::fromPayment),
                game.players.mapValues { (_, player) -> AccountResponse(player.id, player.name) }
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
data class UpdateBuyInRequest(val amount: String)

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

data class BalancesResponse(val balances: List<Item>) {
    data class Item(val accountId: String, val name: String, val balance: String)

    companion object {
        fun fromBalances(balances: List<Balance>): BalancesResponse {
            return BalancesResponse(balances.map { Item(it.accountId, it.name, it.balance.toPlainString()) })
        }
    }
}

data class TransfersResponse(val transfers: List<Item>) {
    data class Item(val id: String?, val accountId: String, val amount: String, val type: String, val createTime: Long)

    companion object {
        fun fromTransfers(transfers: List<Transfer>): TransfersResponse {
            return TransfersResponse(transfers.map {
                Item(
                    it.id,
                    it.accountId,
                    it.amount.toPlainString(),
                    it.type.toString(),
                    it.createTime.toEpochMilli()
                )
            })
        }
    }
}