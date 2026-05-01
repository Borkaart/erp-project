package com.financeiro.app.controller;

import com.financeiro.app.dto.FluxoCaixaDTO;
import com.financeiro.app.service.ContaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/fluxo-caixa")
public class FluxoCaixaController {

    private final ContaService service;

    public FluxoCaixaController(ContaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FluxoCaixaDTO>> fluxoCaixa() {
        return ResponseEntity.ok(service.gerarFluxoCaixa());
    }
}
