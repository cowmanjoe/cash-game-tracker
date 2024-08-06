package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.BuyIn
import com.cowan.cashgametracker.model.Game
import com.cowan.cashgametracker.service.GameService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("game")
class GameController(private val gameService: GameService) {

    @GetMapping("{id}")
    fun getGame(@PathVariable("id") id: String): GameResponse {
        return GameResponse.fromGame(gameService.getGame(id))
    }

    @PostMapping
    fun createGame(): GameResponse {
        return GameResponse.fromGame(gameService.createGame())
    }
}

data class GameResponse(val id: String, val createTime: Long, val buyIn: List<BuyInResponse>) {

    companion object {
        fun fromGame(game: Game): GameResponse {
            return GameResponse(game.id, game.createTime.toEpochMilli(), game.buyIns.map(BuyInResponse::fromBuyIn))
        }
    }
}

data class BuyInResponse(val id: String, val accountId: String, val amount: String) {
    companion object {
        fun fromBuyIn(buyIn: BuyIn): BuyInResponse {
            return BuyInResponse(buyIn.id, buyIn.accountId, buyIn.amount.toPlainString())
        }
    }
}
