package com.cowan.cashgametracker.entity

import org.springframework.data.relational.core.mapping.Table

@Table("GAME_PLAYER")
class GamePlayerEntity(val accountId: String)