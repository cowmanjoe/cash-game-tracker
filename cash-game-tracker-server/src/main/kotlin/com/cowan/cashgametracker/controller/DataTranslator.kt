package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.ValidationException
import java.math.BigDecimal

object DataTranslator {
    fun toBigDecimal(value: String): BigDecimal {
        try {
            return BigDecimal(value)
        } catch (e: NumberFormatException) {
            throw ValidationException("Invalid number: $value")
        }
    }
}