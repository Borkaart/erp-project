package com.financeiro.app.config;

import com.financeiro.app.model.ContaFinanceira;
import com.financeiro.app.repository.ContaFinanceiraRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(ContaFinanceiraRepository contaFinanceiraRepository, JdbcTemplate jdbcTemplate) {
        return args -> {
            // 1. Inicializar Contas Financeiras
            Arrays.asList("Caixa", "Banco do Brasil", "Mercado Pago").forEach(nome -> {
                if (contaFinanceiraRepository.findByNome(nome).isEmpty()) {
                    contaFinanceiraRepository.save(new ContaFinanceira(nome));
                    logger.info("Conta Financeira '{}' criada.", nome);
                }
            });

            System.out.println("DataInitializer: Inicialização concluída.");
        };
    }
}
