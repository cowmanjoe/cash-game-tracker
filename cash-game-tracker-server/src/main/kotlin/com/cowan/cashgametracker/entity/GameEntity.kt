package com.cowan.cashgametracker.entity

import org.springframework.data.relational.core.mapping.MappedCollection
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("GAME")
data class GameEntity(
    val createTime: Instant,
    @MappedCollection
    val buyIns: List<BuyInEntity>,
    var id: String?
)