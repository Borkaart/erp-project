package com.financeiro.app.controller;

import com.financeiro.app.dto.FluxoCaixaResponseDTO;
import com.financeiro.app.service.ContaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/fluxo-caixa")
public class FluxoCaixaController {

    private final ContaService service;

    public FluxoCaixaController(ContaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FluxoCaixaResponseDTO>> fluxoCaixa(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long contaFinanceiraId) {
        
        LocalDate dataInicio = (inicio != null) ? inicio : LocalDate.now().minusMonths(1);
        LocalDate dataFim = (fim != null) ? fim : LocalDate.now().plusMonths(1);
        
        return ResponseEntity.ok(service.listarFluxoCaixa(dataInicio, dataFim, contaFinanceiraId));
    }
}
