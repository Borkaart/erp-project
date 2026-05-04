package com.financeiro.app.dto;

import java.math.BigDecimal;

public class SaldoMensalDTO {
    private Integer mes;
    private Integer ano;
    private BigDecimal saldoInicial;

    public SaldoMensalDTO() {}

    public SaldoMensalDTO(Integer mes, Integer ano, BigDecimal saldoInicial) {
        this.mes = mes;
        this.ano = ano;
        this.saldoInicial = saldoInicial;
    }

    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public BigDecimal getSaldoInicial() { return saldoInicial; }
    public void setSaldoInicial(BigDecimal saldoInicial) { this.saldoInicial = saldoInicial; }
}
