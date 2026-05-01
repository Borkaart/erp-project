package com.financeiro.app.model;

import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contas")
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConta tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConta status;

    @Column(nullable = false)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal saldoRestante;

    @Column(nullable = false)
    private LocalDate dataCriacao;

    private String categoria;

    @ManyToOne(optional = true)
    @JoinColumn(name = "cliente_id", nullable = true)
    private Cliente cliente;

    private String pessoa;

    private String observacoes;

    private Long grupoId; // Para agrupamento de parcelas

    @OneToMany(mappedBy = "conta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Baixa> baixas = new ArrayList<>();

    public Conta() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { 
        this.valorTotal = valorTotal;
        this.atualizarSaldo();
    }

    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }

    public TipoConta getTipo() { return tipo; }
    public void setTipo(TipoConta tipo) { this.tipo = tipo; }

    public StatusConta getStatus() { return status; }
    public void setStatus(StatusConta status) { this.status = status; }

    public BigDecimal getValorPago() { return valorPago; }
    public void setValorPago(BigDecimal valorPago) { 
        this.valorPago = valorPago; 
        this.atualizarSaldo();
    }

    public BigDecimal getSaldoRestante() { return saldoRestante; }
    public void setSaldoRestante(BigDecimal saldoRestante) { this.saldoRestante = saldoRestante; }

    public LocalDate getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDate dataCriacao) { this.dataCriacao = dataCriacao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public String getPessoa() { return pessoa; }
    public void setPessoa(String pessoa) { this.pessoa = pessoa; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public Long getGrupoId() { return grupoId; }
    public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }

    public List<Baixa> getBaixas() { return baixas; }
    public void setBaixas(List<Baixa> baixas) { this.baixas = baixas; }

    public void atualizarSaldo() {
        if (this.valorTotal != null) {
            this.saldoRestante = this.valorTotal.subtract(this.valorPago != null ? this.valorPago : BigDecimal.ZERO);
        }
    }
}
