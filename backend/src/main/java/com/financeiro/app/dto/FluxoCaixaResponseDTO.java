package com.financeiro.app.dto;

import com.financeiro.app.enums.TipoConta;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FluxoCaixaResponseDTO {
    private Long id;
    private LocalDate data;
    private BigDecimal valor;
    private TipoConta tipo;
    private String contaFinanceira;
    private String descricaoConta;
    private BigDecimal saldoAcumulado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public TipoConta getTipo() { return tipo; }
    public void setTipo(TipoConta tipo) { this.tipo = tipo; }

    public String getContaFinanceira() { return contaFinanceira; }
    public void setContaFinanceira(String contaFinanceira) { this.contaFinanceira = contaFinanceira; }

    public String getDescricaoConta() { return descricaoConta; }
    public void setDescricaoConta(String descricaoConta) { this.descricaoConta = descricaoConta; }

    public BigDecimal getSaldoAcumulado() { return saldoAcumulado; }
    public void setSaldoAcumulado(BigDecimal saldoAcumulado) { this.saldoAcumulado = saldoAcumulado; }
}
