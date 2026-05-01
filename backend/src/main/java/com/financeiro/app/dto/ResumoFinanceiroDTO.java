package com.financeiro.app.dto;

import java.math.BigDecimal;

public class ResumoFinanceiroDTO {
    private BigDecimal totalAPagar = BigDecimal.ZERO;
    private BigDecimal totalAReceber = BigDecimal.ZERO;
    private BigDecimal totalPago = BigDecimal.ZERO;
    private BigDecimal totalRecebido = BigDecimal.ZERO;
    private BigDecimal previsaoReceber15Dias = BigDecimal.ZERO;
    private BigDecimal previsaoReceber30Dias = BigDecimal.ZERO;
    private BigDecimal previsaoPagar15Dias = BigDecimal.ZERO;
    private BigDecimal previsaoPagar30Dias = BigDecimal.ZERO;
    private BigDecimal receitaVencida = BigDecimal.ZERO;
    private BigDecimal despesaVencida = BigDecimal.ZERO;

    public BigDecimal getReceitaVencida() { return receitaVencida; }
    public void setReceitaVencida(BigDecimal receitaVencida) { this.receitaVencida = receitaVencida; }

    public BigDecimal getDespesaVencida() { return despesaVencida; }
    public void setDespesaVencida(BigDecimal despesaVencida) { this.despesaVencida = despesaVencida; }

    public BigDecimal getTotalAPagar() { return totalAPagar; }
    public void setTotalAPagar(BigDecimal totalAPagar) { this.totalAPagar = totalAPagar; }

    public BigDecimal getTotalAReceber() { return totalAReceber; }
    public void setTotalAReceber(BigDecimal totalAReceber) { this.totalAReceber = totalAReceber; }

    public BigDecimal getTotalPago() { return totalPago; }
    public void setTotalPago(BigDecimal totalPago) { this.totalPago = totalPago; }

    public BigDecimal getTotalRecebido() { return totalRecebido; }
    public void setTotalRecebido(BigDecimal totalRecebido) { this.totalRecebido = totalRecebido; }

    public BigDecimal getPrevisaoReceber15Dias() { return previsaoReceber15Dias; }
    public void setPrevisaoReceber15Dias(BigDecimal previsaoReceber15Dias) { this.previsaoReceber15Dias = previsaoReceber15Dias; }

    public BigDecimal getPrevisaoReceber30Dias() { return previsaoReceber30Dias; }
    public void setPrevisaoReceber30Dias(BigDecimal previsaoReceber30Dias) { this.previsaoReceber30Dias = previsaoReceber30Dias; }

    public BigDecimal getPrevisaoPagar15Dias() { return previsaoPagar15Dias; }
    public void setPrevisaoPagar15Dias(BigDecimal previsaoPagar15Dias) { this.previsaoPagar15Dias = previsaoPagar15Dias; }

    public BigDecimal getPrevisaoPagar30Dias() { return previsaoPagar30Dias; }
    public void setPrevisaoPagar30Dias(BigDecimal previsaoPagar30Dias) { this.previsaoPagar30Dias = previsaoPagar30Dias; }
}
