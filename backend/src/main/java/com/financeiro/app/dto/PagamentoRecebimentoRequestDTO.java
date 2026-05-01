package com.financeiro.app.dto;

import java.time.LocalDate;

public class PagamentoRecebimentoRequestDTO {
    private LocalDate data;

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}
