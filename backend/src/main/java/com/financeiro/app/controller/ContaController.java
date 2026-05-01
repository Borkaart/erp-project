package com.financeiro.app.controller;

import com.financeiro.app.dto.*;
import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/contas")
public class ContaController {

    private final ContaService service;

    public ContaController(ContaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<List<ContaResponseDTO>> criar(@Valid @RequestBody ContaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<ContaResponseDTO>> listar(
            @RequestParam(required = false) TipoConta tipo,
            @RequestParam(required = false) StatusConta status) {
        if (tipo != null) {
            return ResponseEntity.ok(service.listarPorTipo(tipo));
        }
        if (status != null) {
            return ResponseEntity.ok(service.listarPorStatus(status));
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaResponseDTO> atualizar(
            @PathVariable Long id, @Valid @RequestBody ContaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/baixas")
    public ResponseEntity<Void> realizarBaixa(
            @PathVariable Long id, 
            @Valid @RequestBody BaixaRequestDTO dto) {
        service.realizarBaixa(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<ContaResponseDTO>> listarAlertas() {
        return ResponseEntity.ok(service.listarAlertas());
    }
}
