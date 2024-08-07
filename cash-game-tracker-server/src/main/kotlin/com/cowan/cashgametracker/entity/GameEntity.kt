package com.cowan.cashgametracker.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.MappedCollection
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("GAME")
data class GameEntity(
    val createTime: Instant,
    @MappedCollection(idColumn = "GAME_ID")
    val buyIns: MutableSet<BuyInEntity> = mutableSetOf(),
    @MappedCollection(idColumn = "GAME_ID", keyColumn = "ACCOUNT_ID")
    val cashOuts: MutableMap<String, CashOutEntity> = mutableMapOf(),
    @MappedCollection(idColumn = "GAME_ID")
    val payments: MutableSet<PaymentEntity> = mutableSetOf(),
    @MappedCollection(idColumn = "GAME_ID")
    val players: MutableSet<GamePlayerEntity> = mutableSetOf(),
    @Id var id: String? = null
)