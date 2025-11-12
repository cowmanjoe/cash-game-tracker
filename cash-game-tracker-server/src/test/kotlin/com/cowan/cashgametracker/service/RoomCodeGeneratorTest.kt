package com.cowan.cashgametracker.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RoomCodeGeneratorTest {

    private val generator = RoomCodeGenerator()

    @Test
    fun test_generateCode_returns4LetterCode() {
        val code = generator.generateCode()

        assertEquals(4, code.length)
        assertTrue(code.all { it.isUpperCase() && it.isLetter() })
    }

    @Test
    fun test_generateCode_returnsUniqueCodesOverMultipleCalls() {
        val codes = (1..100).map { generator.generateCode() }.toSet()

        // With 456,976 possible combinations, 100 codes should be unique
        assertTrue(codes.size > 90, "Expected at least 90 unique codes out of 100")
    }
}
