package com.financeiro.app.dto;

import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ContaRequestDTO {

    @NotNull(message = "O tipo da conta é obrigatório")
    private TipoConta tipo;

    @NotBlank(message = "A descrição é obrigatória")
    private String descricao;

    @NotBlank(message = "A categoria é obrigatória")
    private String categoria;

    private Long clienteId;

    private String pessoa;

    @NotNull(message = "A data de vencimento é obrigatória")
    private LocalDate dataVencimento;

    private LocalDate dataPagamentoRecebimento;

    private LocalDate dataPrevistaRecebimento;

    @NotNull(message = "O valor é obrigatório")
    private BigDecimal valor;

    @NotBlank(message = "A forma de pagamento é obrigatória")
    private String formaPagamento;

    @NotNull(message = "O status da conta é obrigatório")
    private StatusConta status;

    private String observacoes;

    public TipoConta getTipo() { return tipo; }
    public void setTipo(TipoConta tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getPessoa() { return pessoa; }
    public void setPessoa(String pessoa) { this.pessoa = pessoa; }

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
