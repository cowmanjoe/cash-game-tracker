package com.cowan.cashgametracker.util

import com.cowan.cashgametracker.model.ValidationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal

class CurrencyAmountServiceTest {

    private val service = CurrencyAmountService()

    // ========== Parse Tests ==========

    @Test
    fun test_parse_validIntegerAmount_returnsScaledBigDecimal() {
        val result = service.parse("90")
        assertEquals(BigDecimal("90.00"), result)
    }

    @Test
    fun test_parse_validAmountWithTwoDecimals_returnsCorrectValue() {
        val result = service.parse("90.50")
        assertEquals(BigDecimal("90.50"), result)
    }

    @Test
    fun test_parse_validAmountWithOneDecimal_addsTrailingZero() {
        val result = service.parse("90.5")
        assertEquals(BigDecimal("90.50"), result)
    }

    @Test
    fun test_parse_amountWithMoreThanTwoDecimals_throwsValidationException() {
        val exception = assertThrows<ValidationException> {
            service.parse("90.123")
        }
        assertEquals("Amount cannot have more than 2 decimal places: 90.123", exception.message)
    }

    @Test
    fun test_parse_invalidString_throwsValidationException() {
        val exception = assertThrows<ValidationException> {
            service.parse("invalid")
        }
        assertEquals("Invalid currency amount: invalid", exception.message)
    }

    // ========== Format Tests ==========

    @Test
    fun test_format_integerBigDecimal_addsTwoDecimalPlaces() {
        val result = service.format(BigDecimal("90"))
        assertEquals("90.00", result)
    }

    @Test
    fun test_format_bigDecimalWithOneDecimal_addsTrailingZero() {
        val result = service.format(BigDecimal("90.5"))
        assertEquals("90.50", result)
    }

    @Test
    fun test_format_bigDecimalRequiringRounding_roundsHalfUp() {
        val result = service.format(BigDecimal("90.125"))
        assertEquals("90.13", result)
    }

    @Test
    fun test_format_bigDecimalWithManyDecimals_formatsToTwoPlaces() {
        val result = service.format(BigDecimal("90.0000000"))
        assertEquals("90.00", result)
    }

    // ========== Round Tests ==========

    @Test
    fun test_round_integerBigDecimal_setsScaleToTwo() {
        val result = service.round(BigDecimal("90"))
        assertEquals(BigDecimal("90.00"), result)
    }

    @Test
    fun test_round_bigDecimalWithOneDecimal_setsScaleToTwo() {
        val result = service.round(BigDecimal("90.5"))
        assertEquals(BigDecimal("90.50"), result)
    }

    @Test
    fun test_round_bigDecimalRequiringRounding_roundsHalfUp() {
        val result = service.round(BigDecimal("90.125"))
        assertEquals(BigDecimal("90.13"), result)
    }

    @Test
    fun test_round_bigDecimalWithManyDecimals_roundsToTwoPlaces() {
        val result = service.round(BigDecimal("90.0000000"))
        assertEquals(BigDecimal("90.00"), result)
    }
}
