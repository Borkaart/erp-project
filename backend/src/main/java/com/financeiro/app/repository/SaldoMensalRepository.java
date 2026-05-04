package com.financeiro.app.repository;

import com.financeiro.app.model.SaldoMensal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SaldoMensalRepository extends JpaRepository<SaldoMensal, Long> {
    Optional<SaldoMensal> findByMesAndAno(Integer mes, Integer ano);
}
