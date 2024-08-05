package com.cowan.cashgametracker.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("ACCOUNT")
data class AccountEntity(
    val name: String,
    @Id var id: String? = null
)