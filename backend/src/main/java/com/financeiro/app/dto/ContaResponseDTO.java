package com.financeiro.app.dto;

import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ContaResponseDTO {

    private Long id;
    private TipoConta tipo;
    private String descricao;
    private String categoria;
    private ClienteDTO cliente;
    private String pessoa;
    private LocalDate dataCriacao;
    private LocalDate dataVencimento;
    private LocalDate dataPagamentoRecebimento;
    private LocalDate dataPrevistaRecebimento;
    private BigDecimal valor;
    private String formaPagamento;
    private StatusConta status;
    private String observacoes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoConta getTipo() { return tipo; }
    public void setTipo(TipoConta tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public ClienteDTO getCliente() { return cliente; }
    public void setCliente(ClienteDTO cliente) { this.cliente = cliente; }

    public String getPessoa() { return pessoa; }
    public void setPessoa(String pessoa) { this.pessoa = pessoa; }

    public LocalDate getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDate dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDate getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(LocalDate dataVencimento) { this.dataVencimento = dataVencimento; }

    public LocalDate getDataPagamentoRecebimento() { return dataPagamentoRecebimento; }
    public void setDataPagamentoRecebimento(LocalDate dataPagamentoRecebimento) { this.dataPagamentoRecebimento = dataPagamentoRecebimento; }

    public LocalDate getDataPrevistaRecebimento() { return dataPrevistaRecebimento; }
    public void setDataPrevistaRecebimento(LocalDate dataPrevistaRecebimento) { this.dataPrevistaRecebimento = dataPrevistaRecebimento; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }

    public StatusConta getStatus() { return status; }
    public void setStatus(StatusConta status) { this.status = status; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
