package com.financeiro.app.service;

import com.financeiro.app.dto.*;
import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.exception.ResourceNotFoundException;
import com.financeiro.app.model.Cliente;
import com.financeiro.app.model.Conta;
import com.financeiro.app.repository.ClienteRepository;
import com.financeiro.app.repository.ContaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContaService {

    private static final Logger logger = LoggerFactory.getLogger(ContaService.class);
    private final ContaRepository repository;
    private final ClienteRepository clienteRepository;

    public ContaService(ContaRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    private void atualizarStatusVencido(Conta conta) {
        if (conta.getStatus() != StatusConta.PAGO && 
            conta.getStatus() != StatusConta.RECEBIDO && 
            conta.getStatus() != StatusConta.CANCELADO) {
            
            if (conta.getDataVencimento().isBefore(LocalDate.now()) && conta.getStatus() != StatusConta.VENCIDO) {
                logger.info("Conta ID {} marcada como VENCIDA automaticamente. Vencimento: {}", conta.getId(), conta.getDataVencimento());
                conta.setStatus(StatusConta.VENCIDO);
            }
        }
    }

    public ContaResponseDTO criar(ContaRequestDTO dto) {
        Cliente cliente = null;
        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + dto.getClienteId()));
        }
        
        Conta conta = toEntity(dto);
        conta.setCliente(cliente);
        conta.setDataCriacao(LocalDate.now());
        Conta salva = repository.save(conta);
        return toDTO(salva);
    }

    public List<ContaResponseDTO> listarTodos() {
        List<Conta> contas = repository.findAll();
        contas.forEach(this::atualizarStatusVencido);
        repository.saveAll(contas);
        return contas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ContaResponseDTO buscarPorId(Long id) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        atualizarStatusVencido(conta);
        repository.save(conta);
        return toDTO(conta);
    }

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
        conta.setDataPagamentoRecebimento(dto.getDataPagamentoRecebimento());
        conta.setDataPrevistaRecebimento(dto.getDataPrevistaRecebimento());
        conta.setValor(dto.getValor());
        conta.setFormaPagamento(dto.getFormaPagamento());
        conta.setStatus(dto.getStatus());
        conta.setObservacoes(dto.getObservacoes());

        Conta salva = repository.save(conta);
        return toDTO(salva);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Conta não encontrada com id: " + id);
        }
        repository.deleteById(id);
    }

    public ContaResponseDTO pagarReceber(Long id, String dataString) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        
        LocalDate dataAtuacao = (dataString != null && !dataString.isEmpty()) 
                ? LocalDate.parse(dataString) 
                : LocalDate.now();

        if (conta.getTipo() == TipoConta.PAGAR || conta.getTipo() == TipoConta.DESPESA) {
            if (conta.getStatus() == StatusConta.PAGO) {
                throw new RuntimeException("Esta conta já foi paga.");
            }
            conta.setStatus(StatusConta.PAGO);
            logger.info("Conta ID {} (DESPESA) paga em {}", conta.getId(), dataAtuacao);
        } else {
            if (conta.getStatus() == StatusConta.RECEBIDO) {
                throw new RuntimeException("Esta conta já foi recebida.");
            }
            conta.setStatus(StatusConta.RECEBIDO);
            logger.info("Conta ID {} (RECEITA) recebida em {}", conta.getId(), dataAtuacao);
        }
        
        conta.setDataPagamentoRecebimento(dataAtuacao);
        return toDTO(repository.save(conta));
    }

    public ContaResponseDTO registrarPagamento(Long id, LocalDate dataManual) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        
        if (conta.getTipo() != TipoConta.PAGAR && conta.getTipo() != TipoConta.DESPESA) {
            throw new RuntimeException("Esta conta não é uma despesa e não pode ser paga.");
        }
        
        if (conta.getStatus() == StatusConta.PAGO) {
            throw new RuntimeException("Esta despesa já está paga.");
        }

        LocalDate dataFinal = (dataManual != null) ? dataManual : LocalDate.now();
        
        conta.setStatus(StatusConta.PAGO);
        conta.setDataPagamentoRecebimento(dataFinal);
        
        logger.info("Pagamento registrado para Conta ID {}. Data: {}. Status: PAGO", id, dataFinal);
        return toDTO(repository.save(conta));
    }

    public ContaResponseDTO registrarRecebimento(Long id, LocalDate dataManual) {
        Conta conta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada com id: " + id));
        
        if (conta.getTipo() != TipoConta.RECEBER && conta.getTipo() != TipoConta.RECEITA) {
            throw new RuntimeException("Esta conta não é uma receita e não pode ser recebida.");
        }
        
        if (conta.getStatus() == StatusConta.RECEBIDO) {
            throw new RuntimeException("Esta receita já está recebida.");
        }

        LocalDate dataFinal = (dataManual != null) ? dataManual : LocalDate.now();
        
        conta.setStatus(StatusConta.RECEBIDO);
        conta.setDataPagamentoRecebimento(dataFinal);
        
        logger.info("Recebimento registrado para Conta ID {}. Data: {}. Status: RECEBIDO", id, dataFinal);
        return toDTO(repository.save(conta));
    }

    public List<ContaResponseDTO> listarPorTipo(TipoConta tipo) {
        return repository.findByTipo(tipo).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarPorStatus(StatusConta status) {
        return repository.findByStatus(status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContaResponseDTO> listarAlertas() {
        LocalDate limite = LocalDate.now().plusDays(3);
        return repository.findByStatusAndDataVencimentoLessThanEqual(StatusConta.PENDENTE, limite)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResumoFinanceiroDTO calcularResumo() {
        List<Conta> contas = repository.findAll();
        ResumoFinanceiroDTO resumo = new ResumoFinanceiroDTO();
        LocalDate hoje = LocalDate.now();
        LocalDate daqui15Dias = hoje.plusDays(15);
        LocalDate daqui30Dias = hoje.plusDays(30);

        for (Conta c : contas) {
            if (c.getTipo() == TipoConta.PAGAR || c.getTipo() == TipoConta.DESPESA) {
                if (c.getStatus() == StatusConta.PENDENTE || c.getStatus() == StatusConta.VENCIDO) {
                    resumo.setTotalAPagar(resumo.getTotalAPagar().add(c.getValor()));
                    if (!c.getDataVencimento().isAfter(daqui15Dias)) {
                        resumo.setPrevisaoPagar15Dias(resumo.getPrevisaoPagar15Dias().add(c.getValor()));
                    }
                    if (!c.getDataVencimento().isAfter(daqui30Dias)) {
                        resumo.setPrevisaoPagar30Dias(resumo.getPrevisaoPagar30Dias().add(c.getValor()));
                    }
                } else if (c.getStatus() == StatusConta.PAGO) {
                    resumo.setTotalPago(resumo.getTotalPago().add(c.getValor()));
                }
            } else if (c.getTipo() == TipoConta.RECEBER || c.getTipo() == TipoConta.RECEITA) {
                if (c.getStatus() == StatusConta.PENDENTE || c.getStatus() == StatusConta.VENCIDO) {
                    resumo.setTotalAReceber(resumo.getTotalAReceber().add(c.getValor()));
                    if (!c.getDataVencimento().isAfter(daqui15Dias)) {
                        resumo.setPrevisaoReceber15Dias(resumo.getPrevisaoReceber15Dias().add(c.getValor()));
                    }
                    if (!c.getDataVencimento().isAfter(daqui30Dias)) {
                        resumo.setPrevisaoReceber30Dias(resumo.getPrevisaoReceber30Dias().add(c.getValor()));
                    }
                } else if (c.getStatus() == StatusConta.RECEBIDO) {
                    resumo.setTotalRecebido(resumo.getTotalRecebido().add(c.getValor()));
                }
            }
        }
        return resumo;
    }

    public List<FluxoCaixaDTO> gerarFluxoCaixa() {
        List<Conta> contas = repository.findAll();
        Map<LocalDate, FluxoCaixaDTO> fluxoPorDia = new TreeMap<>();

        for (Conta c : contas) {
            LocalDate dataAtuacao = ((c.getStatus() == StatusConta.PAGO || c.getStatus() == StatusConta.RECEBIDO) && c.getDataPagamentoRecebimento() != null) 
                    ? c.getDataPagamentoRecebimento() 
                    : c.getDataVencimento();

            fluxoPorDia.putIfAbsent(dataAtuacao, new FluxoCaixaDTO(dataAtuacao, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
            FluxoCaixaDTO fluxo = fluxoPorDia.get(dataAtuacao);

            if (c.getTipo() == TipoConta.RECEBER || c.getTipo() == TipoConta.RECEITA) {
                fluxo.setEntradas(fluxo.getEntradas().add(c.getValor()));
            } else if (c.getTipo() == TipoConta.PAGAR || c.getTipo() == TipoConta.DESPESA) {
                fluxo.setSaidas(fluxo.getSaidas().add(c.getValor()));
            }
        }

        List<FluxoCaixaDTO> fluxoOrdenado = new ArrayList<>(fluxoPorDia.values());
        BigDecimal saldoAcumulado = BigDecimal.ZERO;
        
        for (FluxoCaixaDTO f : fluxoOrdenado) {
            saldoAcumulado = saldoAcumulado.add(f.getEntradas()).subtract(f.getSaidas());
            f.setSaldoAcumulado(saldoAcumulado);
        }

        return fluxoOrdenado;
    }

    public List<CategoriaResumoDTO> listarResumoPorCategoria() {
        List<Conta> contas = repository.findAll();
        Map<String, CategoriaResumoDTO> mapa = new HashMap<>();

        for (Conta c : contas) {
            mapa.putIfAbsent(c.getCategoria(), new CategoriaResumoDTO(c.getCategoria(), BigDecimal.ZERO, BigDecimal.ZERO));
            CategoriaResumoDTO resumo = mapa.get(c.getCategoria());

            if (c.getTipo() == TipoConta.RECEBER || c.getTipo() == TipoConta.RECEITA) {
                resumo.setTotalEntradas(resumo.getTotalEntradas().add(c.getValor()));
            } else if (c.getTipo() == TipoConta.PAGAR || c.getTipo() == TipoConta.DESPESA) {
                resumo.setTotalSaidas(resumo.getTotalSaidas().add(c.getValor()));
            }
        }

        return new ArrayList<>(mapa.values());
    }

    private Conta toEntity(ContaRequestDTO dto) {
        Conta c = new Conta();
        c.setTipo(dto.getTipo());
        c.setDescricao(dto.getDescricao());
        c.setCategoria(dto.getCategoria());
        c.setPessoa(dto.getPessoa());
        // cliente é setado no service (criar/atualizar)
        c.setDataVencimento(dto.getDataVencimento());
        c.setDataPagamentoRecebimento(dto.getDataPagamentoRecebimento());
        c.setDataPrevistaRecebimento(dto.getDataPrevistaRecebimento());
        c.setValor(dto.getValor());
        c.setFormaPagamento(dto.getFormaPagamento());
        c.setStatus(dto.getStatus());
        c.setObservacoes(dto.getObservacoes());
        return c;
    }

    private ContaResponseDTO toDTO(Conta c) {
        ContaResponseDTO dto = new ContaResponseDTO();
        dto.setId(c.getId());
        dto.setTipo(c.getTipo());
        dto.setDescricao(c.getDescricao());
        dto.setCategoria(c.getCategoria());
        dto.setPessoa(c.getPessoa());
        
        if (c.getCliente() != null) {
            ClienteDTO clienteDTO = new ClienteDTO();
            clienteDTO.setId(c.getCliente().getId());
            clienteDTO.setNome(c.getCliente().getNome());
            clienteDTO.setDocumento(c.getCliente().getDocumento());
            clienteDTO.setEmail(c.getCliente().getEmail());
            clienteDTO.setTelefone(c.getCliente().getTelefone());
            dto.setCliente(clienteDTO);
        }

        dto.setDataCriacao(c.getDataCriacao());
        dto.setDataVencimento(c.getDataVencimento());
        dto.setDataPagamentoRecebimento(c.getDataPagamentoRecebimento());
        dto.setDataPrevistaRecebimento(c.getDataPrevistaRecebimento());
        dto.setValor(c.getValor());
        dto.setFormaPagamento(c.getFormaPagamento());
        dto.setStatus(c.getStatus());
        dto.setObservacoes(c.getObservacoes());
        return dto;
    }
}
