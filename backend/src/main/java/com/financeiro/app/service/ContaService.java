package com.financeiro.app.service;

import com.financeiro.app.dto.*;
import com.financeiro.app.enums.FormaPagamento;
import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.exception.ResourceNotFoundException;
import com.financeiro.app.model.*;
import com.financeiro.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContaService {

    private static final Logger logger = LoggerFactory.getLogger(ContaService.class);
    private final ContaRepository repository;
    private final ClienteRepository clienteRepository;
    private final BaixaRepository baixaRepository;
    private final ContaFinanceiraRepository contaFinanceiraRepository;
    private final SaldoMensalRepository saldoMensalRepository;

    public ContaService(ContaRepository repository, 
                        ClienteRepository clienteRepository,
                        BaixaRepository baixaRepository,
                        ContaFinanceiraRepository contaFinanceiraRepository,
                        SaldoMensalRepository saldoMensalRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.baixaRepository = baixaRepository;
        this.contaFinanceiraRepository = contaFinanceiraRepository;
        this.saldoMensalRepository = saldoMensalRepository;
    }

    private void atualizarStatusVencido(Conta conta) {
        if (conta.getStatus() == StatusConta.PENDENTE || conta.getStatus() == StatusConta.PARCIAL) {
            if (conta.getDataVencimento().isBefore(LocalDate.now())) {
                conta.setStatus(StatusConta.VENCIDO);
            }
        }
    }

    @Transactional
    public List<ContaResponseDTO> criar(ContaRequestDTO dto) {
        Cliente cliente = null;
        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + dto.getClienteId()));
        }

        int parcelas = (dto.getQuantidadeParcelas() != null && dto.getQuantidadeParcelas() > 1) 
                       ? dto.getQuantidadeParcelas() : 1;
        
        List<Conta> contasSalvas = new ArrayList<>();
        Long grupoId = System.currentTimeMillis();

        BigDecimal valorParcela = dto.getValorTotal().divide(BigDecimal.valueOf(parcelas), 2, RoundingMode.HALF_UP);
        BigDecimal diferenca = dto.getValorTotal().subtract(valorParcela.multiply(BigDecimal.valueOf(parcelas)));

        for (int i = 0; i < parcelas; i++) {
            Conta conta = new Conta();
            conta.setTipo(dto.getTipo());
            
            String sufixo = parcelas > 1 ? String.format(" (%d/%d)", i + 1, parcelas) : "";
            conta.setDescricao(dto.getDescricao() + sufixo);
            
            conta.setCategoria(dto.getCategoria());
            conta.setCliente(cliente);
            conta.setPessoa(dto.getPessoa());
            conta.setDataCriacao(LocalDate.now());
            conta.setDataVencimento(dto.getDataVencimento().plusMonths(i));
            
            BigDecimal valorAtual = (i == parcelas - 1) ? valorParcela.add(diferenca) : valorParcela;
            conta.setValorTotal(valorAtual);
            conta.setStatus(StatusConta.PENDENTE);
            conta.setObservacoes(dto.getObservacoes());
            if (parcelas > 1) {
                conta.setGrupoId(grupoId);
            }

            contasSalvas.add(repository.save(conta));
        }

        return contasSalvas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarTodos() {
        List<Conta> contas = repository.findAll();
        contas.forEach(this::atualizarStatusVencido);
        return contas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarPorTipo(TipoConta tipo) {
        List<Conta> contas = repository.findByTipo(tipo);
        contas.forEach(this::atualizarStatusVencido);
        return contas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarPorStatus(StatusConta status) {
        List<Conta> contas = repository.findByStatus(status);
        contas.forEach(this::atualizarStatusVencido);
        return contas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarAlertas() {
        List<Conta> contas = repository.findByStatusAndDataVencimentoLessThanEqual(StatusConta.PENDENTE, LocalDate.now());
        return contas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ContaResponseDTO buscarPorId(Long id) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        atualizarStatusVencido(conta);
        return toDTO(conta);
    }

    @Transactional
    public ContaResponseDTO atualizar(Long id, ContaRequestDTO dto) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        
        if (dto.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + dto.getClienteId()));
            conta.setCliente(cliente);
        } else {
            conta.setCliente(null);
        }

        conta.setTipo(dto.getTipo());
        conta.setDescricao(dto.getDescricao());
        conta.setCategoria(dto.getCategoria());
        conta.setPessoa(dto.getPessoa());
        conta.setDataVencimento(dto.getDataVencimento());
        conta.setValorTotal(dto.getValorTotal());
        conta.setObservacoes(dto.getObservacoes());

        return toDTO(repository.save(conta));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Conta não encontrada com id: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void realizarBaixa(Long contaId, BaixaRequestDTO dto) {
        Conta conta = repository.findById(contaId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        if (dto.getValor().compareTo(conta.getSaldoRestante()) > 0) {
            throw new RuntimeException("Valor da baixa superior ao saldo restante");
        }

        ContaFinanceira cf = mapearContaFinanceira(dto.getFormaPagamento());
        
        Baixa baixa = new Baixa();
        baixa.setConta(conta);
        baixa.setValor(dto.getValor());
        baixa.setDataPagamento(dto.getDataPagamento());
        baixa.setFormaPagamento(dto.getFormaPagamento());
        baixa.setContaFinanceira(cf);
        
        baixaRepository.save(baixa);

        // Garantir que o saldo não é nulo antes de somar/subtrair
        BigDecimal saldoFinanceiroAtual = cf.getSaldoAtual() != null ? cf.getSaldoAtual() : BigDecimal.ZERO;

        // Atualizar saldo da conta financeira
        if (conta.getTipo() == TipoConta.RECEITA) {
            cf.setSaldoAtual(saldoFinanceiroAtual.add(dto.getValor()));
        } else {
            cf.setSaldoAtual(saldoFinanceiroAtual.subtract(dto.getValor()));
        }
        contaFinanceiraRepository.save(cf);

        // Garantir que valorPago não é nulo
        BigDecimal valorPagoAtual = conta.getValorPago() != null ? conta.getValorPago() : BigDecimal.ZERO;
        conta.setValorPago(valorPagoAtual.add(dto.getValor()));
        
        // Recalcular saldo e garantir que não é nulo antes de comparar
        conta.atualizarSaldo();
        BigDecimal saldoRestante = conta.getSaldoRestante() != null ? conta.getSaldoRestante() : BigDecimal.ZERO;

        if (saldoRestante.compareTo(BigDecimal.ZERO) <= 0) {
            conta.setStatus(StatusConta.PAGO);
        } else {
            conta.setStatus(StatusConta.PARCIAL);
        }
        
        repository.save(conta);
    }

    private ContaFinanceira mapearContaFinanceira(FormaPagamento forma) {
        String nomeConta;
        switch (forma) {
            case DINHEIRO:
                nomeConta = "Caixa";
                break;
            case CARTAO_CREDITO:
                nomeConta = "Mercado Pago";
                break;
            default:
                nomeConta = "Banco do Brasil";
                break;
        }
        return contaFinanceiraRepository.findByNome(nomeConta)
                .orElseGet(() -> contaFinanceiraRepository.save(new ContaFinanceira(nomeConta)));
    }

    public FluxoCaixaRelatorioDTO listarFluxoCaixa(LocalDate inicio, LocalDate fim, Long contaFinanceiraId) {
        List<Baixa> baixas;
        if (contaFinanceiraId != null) {
            ContaFinanceira cf = contaFinanceiraRepository.findById(contaFinanceiraId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conta financeira não encontrada"));
            baixas = baixaRepository.findByDataPagamentoBetweenAndContaFinanceira(inicio, fim, cf);
        } else {
            baixas = baixaRepository.findByDataPagamentoBetween(inicio, fim);
        }

        // Ordenar baixas por data para cálculo de saldo acumulado
        baixas.sort(Comparator.comparing(Baixa::getDataPagamento).thenComparing(Baixa::getId));

        // Calcular Saldo Inicial do Período
        BigDecimal saldoInicial = buscarOuCalcularSaldoInicial(inicio, contaFinanceiraId);
        BigDecimal saldoAcumulado = saldoInicial;
        
        List<FluxoCaixaResponseDTO> dtos = new ArrayList<>();

        for (Baixa b : baixas) {
            if (b.getConta().getTipo() == TipoConta.RECEITA) {
                saldoAcumulado = saldoAcumulado.add(b.getValor());
            } else {
                saldoAcumulado = saldoAcumulado.subtract(b.getValor());
            }

            FluxoCaixaResponseDTO dto = new FluxoCaixaResponseDTO();
            dto.setId(b.getId());
            dto.setData(b.getDataPagamento());
            dto.setValor(b.getValor());
            dto.setTipo(b.getConta().getTipo());
            dto.setContaFinanceira(b.getContaFinanceira().getNome());
            dto.setDescricaoConta(b.getConta().getDescricao());
            dto.setSaldoAcumulado(saldoAcumulado);
            dtos.add(dto);
        }

        return new FluxoCaixaRelatorioDTO(saldoInicial, saldoAcumulado, dtos);
    }

    private BigDecimal buscarOuCalcularSaldoInicial(LocalDate data, Long contaFinanceiraId) {
        // 1. Tentar buscar saldo manual para o mês/ano
        Optional<SaldoMensal> saldoManual = saldoMensalRepository.findByMesAndAno(data.getMonthValue(), data.getYear());
        
        if (saldoManual.isPresent()) {
            return saldoManual.get().getSaldoInicial();
        }

        // 2. Se não houver saldo manual, calcular com base no histórico anterior
        // Buscar todas as baixas anteriores à data de início
        List<Baixa> baixasAnteriores;
        if (contaFinanceiraId != null) {
            ContaFinanceira cf = contaFinanceiraRepository.findById(contaFinanceiraId).orElse(null);
            baixasAnteriores = baixaRepository.findByDataPagamentoBeforeAndContaFinanceira(data, cf);
        } else {
            baixasAnteriores = baixaRepository.findByDataPagamentoBefore(data);
        }

        BigDecimal saldoCalculado = BigDecimal.ZERO;
        for (Baixa b : baixasAnteriores) {
            if (b.getConta().getTipo() == TipoConta.RECEITA) {
                saldoCalculado = saldoCalculado.add(b.getValor());
            } else {
                saldoCalculado = saldoCalculado.subtract(b.getValor());
            }
        }

        // Tentar encontrar o saldo manual mais próximo anterior para somar ao calculado
        // Simplificação: se não tem manual no mês atual, assume que o saldo começou do zero em algum momento
        // ou usa o último manual disponível e soma as baixas desde então.
        // Para este ERP, vamos apenas somar as baixas anteriores se não houver manual.
        
        return saldoCalculado;
    }

    @Transactional
    public void salvarSaldoInicial(int mes, int ano, BigDecimal valor) {
        SaldoMensal saldo = saldoMensalRepository.findByMesAndAno(mes, ano)
                .orElse(new SaldoMensal(mes, ano, valor));
        saldo.setSaldoInicial(valor);
        saldoMensalRepository.save(saldo);
    }

    public BigDecimal buscarSaldoInicial(int mes, int ano) {
        return saldoMensalRepository.findByMesAndAno(mes, ano)
                .map(SaldoMensal::getSaldoInicial)
                .orElse(BigDecimal.ZERO);
    }

    public ResumoFinanceiroDTO calcularResumo() {
        List<Conta> contas = repository.findAll();
        ResumoFinanceiroDTO resumo = new ResumoFinanceiroDTO();
        LocalDate hoje = LocalDate.now();
        LocalDate daqui15Dias = hoje.plusDays(15);
        LocalDate daqui30Dias = hoje.plusDays(30);

        for (Conta c : contas) {
            this.atualizarStatusVencido(c); // Garantir que o status está atualizado antes de somar
            if (c.getTipo() == TipoConta.DESPESA) {
                if (c.getStatus() != StatusConta.PAGO) {
                    resumo.setTotalAPagar(resumo.getTotalAPagar().add(c.getSaldoRestante()));
                    if (!c.getDataVencimento().isAfter(daqui15Dias)) {
                        resumo.setPrevisaoPagar15Dias(resumo.getPrevisaoPagar15Dias().add(c.getSaldoRestante()));
                    }
                    if (!c.getDataVencimento().isAfter(daqui30Dias)) {
                        resumo.setPrevisaoPagar30Dias(resumo.getPrevisaoPagar30Dias().add(c.getSaldoRestante()));
                    }
                    if (c.getStatus() == StatusConta.VENCIDO) {
                        resumo.setDespesaVencida(resumo.getDespesaVencida().add(c.getSaldoRestante()));
                    }
                }
                resumo.setTotalPago(resumo.getTotalPago().add(c.getValorPago()));
            } else {
                if (c.getStatus() != StatusConta.PAGO) {
                    resumo.setTotalAReceber(resumo.getTotalAReceber().add(c.getSaldoRestante()));
                    if (!c.getDataVencimento().isAfter(daqui15Dias)) {
                        resumo.setPrevisaoReceber15Dias(resumo.getPrevisaoReceber15Dias().add(c.getSaldoRestante()));
                    }
                    if (!c.getDataVencimento().isAfter(daqui30Dias)) {
                        resumo.setPrevisaoReceber30Dias(resumo.getPrevisaoReceber30Dias().add(c.getSaldoRestante()));
                    }
                    if (c.getStatus() == StatusConta.VENCIDO) {
                        resumo.setReceitaVencida(resumo.getReceitaVencida().add(c.getSaldoRestante()));
                    }
                }
                resumo.setTotalRecebido(resumo.getTotalRecebido().add(c.getValorPago()));
            }
        }
        return resumo;
    }

    public List<CategoriaResumoDTO> listarResumoPorCategoria() {
        List<Conta> contas = repository.findAll();
        Map<String, CategoriaResumoDTO> resumo = new HashMap<>();

        for (Conta c : contas) {
            String cat = c.getCategoria() != null ? c.getCategoria() : "Sem Categoria";
            CategoriaResumoDTO dto = resumo.computeIfAbsent(cat, k -> new CategoriaResumoDTO(k, BigDecimal.ZERO, BigDecimal.ZERO));
            
            if (c.getTipo() == TipoConta.RECEITA) {
                dto.setTotalEntradas(dto.getTotalEntradas().add(c.getValorPago()));
            } else {
                dto.setTotalSaidas(dto.getTotalSaidas().add(c.getValorPago()));
            }
        }
        return new ArrayList<>(resumo.values());
    }

    public ContaResponseDTO toDTO(Conta c) {
        ContaResponseDTO dto = new ContaResponseDTO();
        dto.setId(c.getId());
        dto.setTipo(c.getTipo());
        dto.setDescricao(c.getDescricao());
        dto.setCategoria(c.getCategoria());
        if (c.getCliente() != null) {
            dto.setCliente(toClienteDTO(c.getCliente()));
        }
        dto.setPessoa(c.getPessoa());
        dto.setDataCriacao(c.getDataCriacao());
        dto.setDataVencimento(c.getDataVencimento());
        dto.setValorTotal(c.getValorTotal());
        dto.setValorPago(c.getValorPago());
        dto.setSaldoRestante(c.getSaldoRestante());
        dto.setStatus(c.getStatus());
        dto.setObservacoes(c.getObservacoes());
        dto.setGrupoId(c.getGrupoId());
        return dto;
    }

    private ClienteDTO toClienteDTO(Cliente c) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setDocumento(c.getDocumento());
        dto.setEmail(c.getEmail());
        dto.setTelefone(c.getTelefone());
        return dto;
    }

    private Conta toEntity(ContaRequestDTO dto) {
        Conta c = new Conta();
        c.setTipo(dto.getTipo());
        c.setDescricao(dto.getDescricao());
        c.setCategoria(dto.getCategoria());
        c.setPessoa(dto.getPessoa());
        c.setDataVencimento(dto.getDataVencimento());
        c.setValorTotal(dto.getValorTotal());
        c.setObservacoes(dto.getObservacoes());
        return c;
    }
}
