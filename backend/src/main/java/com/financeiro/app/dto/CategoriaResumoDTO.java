package com.financeiro.app.dto;

import java.math.BigDecimal;

public class CategoriaResumoDTO {
    private String categoria;
    private BigDecimal totalEntradas;
    private BigDecimal totalSaidas;

    public CategoriaResumoDTO(String categoria, BigDecimal totalEntradas, BigDecimal totalSaidas) {
        this.categoria = categoria;
        this.totalEntradas = totalEntradas;
        this.totalSaidas = totalSaidas;
    }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public BigDecimal getTotalEntradas() { return totalEntradas; }
    public void setTotalEntradas(BigDecimal totalEntradas) { this.totalEntradas = totalEntradas; }

    public BigDecimal getTotalSaidas() { return totalSaidas; }
    public void setTotalSaidas(BigDecimal totalSaidas) { this.totalSaidas = totalSaidas; }
}
