package com.cowan.cashgametracker.config

import com.cowan.cashgametracker.entity.AccountEntity
import com.cowan.cashgametracker.entity.EntityUtil
import com.cowan.cashgametracker.entity.GameEntity
import com.cowan.cashgametracker.model.Account
import com.cowan.cashgametracker.model.Game
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jdbc.repository.config.AbstractJdbcConfiguration
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories
import org.springframework.data.relational.core.mapping.event.BeforeConvertCallback
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType
import org.springframework.transaction.TransactionManager
import javax.sql.DataSource


@Configuration
class JdbcConfig : AbstractJdbcConfiguration() {

    @Bean
    fun dataSource(): DataSource {
        val builder = EmbeddedDatabaseBuilder()
        return builder.setType(EmbeddedDatabaseType.H2).build()
    }

    @Bean
    fun namedParameterJdbcOperations(dataSource: DataSource): NamedParameterJdbcTemplate {
        return NamedParameterJdbcTemplate(dataSource)
    }

    @Bean
    fun transactionManager(dataSource: DataSource): TransactionManager {
        return DataSourceTransactionManager(dataSource)
    }

    @Bean
    fun accountBeforeConvertCallback(): BeforeConvertCallback<AccountEntity> {
        return BeforeConvertCallback<AccountEntity> { account ->
            if (account.id == null) {
                account.id = EntityUtil.generateNewId()
            }

            account
        }
    }

    @Bean
    fun gameBeforeConvertCallback(): BeforeConvertCallback<GameEntity> {
        return BeforeConvertCallback<GameEntity> { game ->
            if (game.id == null) {
                game.id = EntityUtil.generateNewId()
            }

            game.buyIns.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }
            game.cashOuts.values.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }
            game.payments.filter { it.id == null }.forEach { it.id = EntityUtil.generateNewId() }

            game
        }
    }
}