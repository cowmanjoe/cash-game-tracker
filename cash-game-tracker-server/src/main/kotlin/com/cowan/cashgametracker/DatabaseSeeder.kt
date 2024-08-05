package com.cowan.cashgametracker

import jakarta.annotation.PostConstruct
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class DatabaseSeeder(private val jdbcTemplate: JdbcTemplate) {

    @PostConstruct
    fun insertData() {
        jdbcTemplate.execute("INSERT INTO account(name, ID) VALUES('Cowan', 'Test1')")
    }
}