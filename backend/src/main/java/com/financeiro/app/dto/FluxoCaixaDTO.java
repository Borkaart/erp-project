package com.financeiro.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FluxoCaixaDTO {
    private LocalDate data;
    private BigDecimal entradas;
    private BigDecimal saidas;
    private BigDecimal saldoAcumulado;

    public FluxoCaixaDTO(LocalDate data, BigDecimal entradas, BigDecimal saidas, BigDecimal saldoAcumulado) {
        this.data = data;
        this.entradas = entradas;
        this.saidas = saidas;
        this.saldoAcumulado = saldoAcumulado;
    }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public BigDecimal getEntradas() { return entradas; }
    public void setEntradas(BigDecimal entradas) { this.entradas = entradas; }

    public BigDecimal getSaidas() { return saidas; }
    public void setSaidas(BigDecimal saidas) { this.saidas = saidas; }

    public BigDecimal getSaldoAcumulado() { return saldoAcumulado; }
    public void setSaldoAcumulado(BigDecimal saldoAcumulado) { this.saldoAcumulado = saldoAcumulado; }
}
