package com.cowan.cashgametracker.model

object ModelUtil {
    fun validate(condition: Boolean, lazyMessage: () -> String) {
        if (!condition) {
            throw ValidationException(lazyMessage())
        }
    }
}

open class ValidationException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
