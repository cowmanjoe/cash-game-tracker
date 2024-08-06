package com.cowan.cashgametracker.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.MappedCollection
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("GAME")
data class GameEntity(
    val createTime: Instant,
    @MappedCollection(idColumn = "GAME_ID")
    val buyIns: MutableSet<BuyInEntity>,
    @MappedCollection(idColumn = "GAME_ID", keyColumn = "ACCOUNT_ID")
    val cashOuts: MutableMap<String, CashOutEntity>,
    @Id var id: String? = null
)