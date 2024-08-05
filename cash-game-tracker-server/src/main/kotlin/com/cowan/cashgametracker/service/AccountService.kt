package com.cowan.cashgametracker.service

import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.AccountEntity
import com.cowan.cashgametracker.model.Account
import com.cowan.cashgametracker.repository.AccountRepository
import org.springframework.stereotype.Component

@Component
class AccountService(private val accountRepository: AccountRepository) {

    fun getAccount(id: String): Account {
        return getAccount(accountRepository.getById(id))
    }

    fun registerAccount(name: String): Account {
        val accountEntity = AccountEntity(name)

        accountRepository.save(accountEntity)

        return getAccount(accountEntity)
    }

    private fun getAccount(accountEntity: AccountEntity): Account {
        return Account(EntityUtil.requireNotNullId(accountEntity.id), accountEntity.name)
    }
}