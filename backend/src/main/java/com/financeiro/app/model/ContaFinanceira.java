package com.financeiro.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "contas_financeiras")
public class ContaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(nullable = true)
    private java.math.BigDecimal saldoAtual = java.math.BigDecimal.ZERO;

    public ContaFinanceira() {
    }

    public ContaFinanceira(String nome) {
        this.nome = nome;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public java.math.BigDecimal getSaldoAtual() { return saldoAtual; }
    public void setSaldoAtual(java.math.BigDecimal saldoAtual) { this.saldoAtual = saldoAtual; }
}
