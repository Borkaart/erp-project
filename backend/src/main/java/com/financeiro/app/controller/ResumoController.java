package com.financeiro.app.controller;

import com.financeiro.app.dto.ResumoFinanceiroDTO;
import com.financeiro.app.service.ContaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/resumo")
public class ResumoController {

    private final ContaService service;

    public ResumoController(ContaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ResumoFinanceiroDTO> resumo() {
        return ResponseEntity.ok(service.calcularResumo());
    }
}
