package com.cowan.cashgametracker

import jakarta.annotation.PostConstruct
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class DatabaseSeeder(private val jdbcTemplate: JdbcTemplate) {

//    @PostConstruct
//    fun insertData() {
//        jdbcTemplate.execute("INSERT INTO account(name, ID) VALUES('Cowan', 'Account1')")
//        jdbcTemplate.execute("INSERT INTO GAME(CREATE_TIME, ID) VALUES('2024-08-05', 'Game1')")
//        jdbcTemplate.execute("INSERT INTO BUY_IN(ACCOUNT_ID, AMOUNT, CREATE_TIME, ID) VALUES('Account1', ")
//    }
}