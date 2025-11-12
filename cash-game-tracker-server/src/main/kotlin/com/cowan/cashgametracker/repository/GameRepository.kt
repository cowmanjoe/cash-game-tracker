package com.cowan.cashgametracker.repository

import com.cowan.cashgametracker.entity.GameEntity
import org.springframework.data.repository.CrudRepository

interface GameRepository : CrudRepository<GameEntity, String> {
    fun getById(id: String): GameEntity

    // NEW: Find by room code (any status)
    fun findByRoomCode(roomCode: String): GameEntity?

    // NEW: Find by room code and status (for active games only)
    fun findByRoomCodeAndStatus(roomCode: String, status: String): GameEntity?
}