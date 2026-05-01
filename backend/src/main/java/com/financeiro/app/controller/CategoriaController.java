package com.financeiro.app.controller;

import com.financeiro.app.dto.CategoriaResumoDTO;
import com.financeiro.app.service.ContaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final ContaService service;

    public CategoriaController(ContaService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    public ResponseEntity<List<CategoriaResumoDTO>> categoriasResumo() {
        return ResponseEntity.ok(service.listarResumoPorCategoria());
    }
}
