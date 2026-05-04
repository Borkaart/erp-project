package com.financeiro.app.dto;

import java.math.BigDecimal;
import java.util.List;

public class FluxoCaixaRelatorioDTO {
    private BigDecimal saldoInicial;
    private BigDecimal saldoFinal;
    private List<FluxoCaixaResponseDTO> itens;

    public FluxoCaixaRelatorioDTO() {}

    public FluxoCaixaRelatorioDTO(BigDecimal saldoInicial, BigDecimal saldoFinal, List<FluxoCaixaResponseDTO> itens) {
        this.saldoInicial = saldoInicial;
        this.saldoFinal = saldoFinal;
        this.itens = itens;
    }

    public BigDecimal getSaldoInicial() { return saldoInicial; }
    public void setSaldoInicial(BigDecimal saldoInicial) { this.saldoInicial = saldoInicial; }

    public BigDecimal getSaldoFinal() { return saldoFinal; }
    public void setSaldoFinal(BigDecimal saldoFinal) { this.saldoFinal = saldoFinal; }

    public List<FluxoCaixaResponseDTO> getItens() { return itens; }
    public void setItens(List<FluxoCaixaResponseDTO> itens) { this.itens = itens; }
}
