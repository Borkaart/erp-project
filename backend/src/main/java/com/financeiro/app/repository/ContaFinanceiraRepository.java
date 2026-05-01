package com.financeiro.app.repository;

import com.financeiro.app.model.ContaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ContaFinanceiraRepository extends JpaRepository<ContaFinanceira, Long> {
    Optional<ContaFinanceira> findByNome(String nome);
}
