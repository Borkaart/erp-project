package com.financeiro.app.repository;

import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Long> {
    List<Conta> findByTipo(TipoConta tipo);
    List<Conta> findByStatus(StatusConta status);
    List<Conta> findByStatusAndDataVencimentoLessThanEqual(StatusConta status, LocalDate data);
}
