package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.ValidationException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus

private val LOG = KotlinLogging.logger {}

@CrossOrigin(origins = ["*"])
open class BaseController {

    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ValidationException::class)
    fun handleValidationException(exception: ValidationException): ErrorServerResponse<*> {
        return ErrorServerResponse<Nothing>(ValidationErrorInfo(exception.message))
    }

    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception::class)
    fun handleServerException(exception: Exception): ErrorServerResponse<*> {
        LOG.error(exception) { "Error occurred during request in ${javaClass.simpleName}" }
        return ErrorServerResponse<Nothing>(ServerErrorInfo())
    }
}
