package com.cowan.cashgametracker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CashGameTrackerApplication

fun main(args: Array<String>) {
	runApplication<CashGameTrackerApplication>(*args)
}
