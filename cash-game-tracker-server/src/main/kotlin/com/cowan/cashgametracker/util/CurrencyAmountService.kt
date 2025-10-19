package com.cowan.cashgametracker.util

import com.cowan.cashgametracker.model.ValidationException
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.math.RoundingMode

@Component
class CurrencyAmountService {
    companion object {
        private const val SCALE = 2
        private val ROUNDING_MODE = RoundingMode.HALF_UP
    }

    /**
     * Validates and parses a string value to a BigDecimal currency amount.
     * The input must represent a valid number with at most 2 decimal places.
     *
     * @param value The string value to parse (e.g., "90", "90.5", "90.50")
     * @return BigDecimal with scale of 2, rounded using HALF_UP if necessary
     * @throws ValidationException if the value is invalid or has more than 2 decimal places
     */
    fun parse(value: String): BigDecimal {
        try {
            val decimal = BigDecimal(value)

            // Check if the input has more than 2 decimal places
            if (decimal.scale() > SCALE) {
                throw ValidationException("Amount cannot have more than 2 decimal places: $value")
            }

            // Set scale to exactly 2 decimal places
            return decimal.setScale(SCALE, ROUNDING_MODE)
        } catch (e: NumberFormatException) {
            throw ValidationException("Invalid currency amount: $value")
        }
    }

    /**
     * Rounds a BigDecimal amount to exactly 2 decimal places.
     * Uses HALF_UP rounding mode (standard banking rounding).
     *
     * @param amount The BigDecimal amount to round
     * @return BigDecimal with scale of 2
     */
    fun round(amount: BigDecimal): BigDecimal {
        return amount.setScale(SCALE, ROUNDING_MODE)
    }

    /**
     * Formats a BigDecimal amount to a string with exactly 2 decimal places.
     * Uses HALF_UP rounding mode (standard banking rounding).
     *
     * @param amount The BigDecimal amount to format
     * @return String representation with 2 decimal places (e.g., "90.00")
     */
    fun format(amount: BigDecimal): String {
        return round(amount).toPlainString()
    }
}
