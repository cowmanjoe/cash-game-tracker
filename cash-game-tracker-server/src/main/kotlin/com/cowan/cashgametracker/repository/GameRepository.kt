package com.cowan.cashgametracker.repository

import com.cowan.cashgametracker.entity.GameEntity
import org.springframework.data.repository.CrudRepository

interface GameRepository : CrudRepository<GameEntity, String> {
    fun getById(id: String): GameEntity
}