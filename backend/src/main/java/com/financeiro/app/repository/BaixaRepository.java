package com.financeiro.app.repository;

import com.financeiro.app.model.Baixa;
import com.financeiro.app.model.ContaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BaixaRepository extends JpaRepository<Baixa, Long> {
    List<Baixa> findByContaId(Long contaId);
    List<Baixa> findByDataPagamentoBetween(LocalDate start, LocalDate end);
    List<Baixa> findByContaFinanceira(ContaFinanceira contaFinanceira);
    List<Baixa> findByDataPagamentoBetweenAndContaFinanceira(LocalDate start, LocalDate end, ContaFinanceira contaFinanceira);
}
