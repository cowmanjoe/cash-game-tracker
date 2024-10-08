package com.cowan.cashgametracker.controller

import com.cowan.cashgametracker.model.Account
import com.cowan.cashgametracker.service.AccountService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("account")
class AccountController(private val accountService: AccountService) : BaseController() {

    @GetMapping("{id}")
    fun getAccount(@PathVariable("id") id: String): ServerResponse<AccountResponse> {
        return SuccessServerResponse(AccountResponse.fromAccount(accountService.getAccount(id)))
    }

    @PostMapping("register")
    fun registerAccount(@RequestBody request: RegisterAccountRequest): ServerResponse<AccountResponse> {
        return SuccessServerResponse(AccountResponse.fromAccount(accountService.registerAccount(request.name)))
    }
}

data class AccountResponse(val id: String, val name: String) {
    companion object {
        fun fromAccount(account: Account): AccountResponse {
            return AccountResponse(account.id, account.name)
        }
    }
}

data class RegisterAccountRequest(val name: String)
