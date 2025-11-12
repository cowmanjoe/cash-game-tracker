package com.cowan.cashgametracker.service

import org.springframework.stereotype.Component
import java.security.SecureRandom

@Component
class RoomCodeGenerator {

    private val random = SecureRandom()

    companion object {
        private const val CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        private const val CODE_LENGTH = 4
    }

    fun generateCode(): String {
        return (1..CODE_LENGTH)
            .map { CHARSET[random.nextInt(CHARSET.length)] }
            .joinToString("")
    }
}
