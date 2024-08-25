package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.ValidationException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus

@CrossOrigin(origins = ["*"])
open class BaseController {
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ValidationException::class)
    fun handleValidationException(exception: ValidationException): ValidationErrorResponse {
        return ValidationErrorResponse(exception.message)
    }
}

data class ValidationErrorResponse(val message: String)