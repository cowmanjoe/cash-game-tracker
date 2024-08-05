package com.cowan.cashgametracker.entity

import java.util.*

object EntityUtil {
    fun generateNewId(): String = UUID.randomUUID().toString()

    fun requireNotNullId(id: String?): String = requireNotNull(id) { "Entity must have non-null id, is it persisted?:" }
}