package com.cowan.cashgametracker.controller

interface ServerResponse<T> {
    val isError: Boolean
    val error: ErrorInfo?
    val data: T?
}

data class SuccessServerResponse<T>(override val data: T) : ServerResponse<T> {
    override val isError = false
    override val error = null
}

data class ErrorServerResponse<T>(override val error: ErrorInfo) : ServerResponse<T> {
    override val isError = true
    override val data = null
}

interface ErrorInfo {
    val type: String
}

class ValidationErrorInfo(val message: String) : ErrorInfo{
    override val type = "VALIDATION"
}

class ServerErrorInfo : ErrorInfo {
    override val type = "SERVER"
    val message = "Unknown error occurred"
}