package com.cowan.cashgametracker.repository

import com.cowan.cashgametracker.entity.AccountEntity
import org.springframework.data.repository.CrudRepository

interface AccountRepository : CrudRepository<AccountEntity, String> {
    fun getById(id: String): AccountEntity
}