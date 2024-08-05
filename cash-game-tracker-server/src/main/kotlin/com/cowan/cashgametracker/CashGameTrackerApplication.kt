package com.cowan.cashgametracker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories

@SpringBootApplication
@EnableJdbcRepositories
class CashGameTrackerApplication

fun main(args: Array<String>) {
	runApplication<CashGameTrackerApplication>(*args)
}
