package com.financeiro.app.config;

import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.model.Cliente;
import com.financeiro.app.model.Conta;
import com.financeiro.app.repository.ClienteRepository;
import com.financeiro.app.repository.ContaRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Configuration
public class DataInitializer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);
    private final ClienteRepository clienteRepository;
    private final ContaRepository contaRepository;
    private final JdbcTemplate jdbcTemplate;
    private final Random random = new Random();

    public DataInitializer(ClienteRepository clienteRepository, ContaRepository contaRepository, JdbcTemplate jdbcTemplate) {
        this.clienteRepository = clienteRepository;
        this.contaRepository = contaRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        // 1. Corrigir apenas as constraints se necessário (não apaga dados)
        try {
            jdbcTemplate.execute("ALTER TABLE contas DROP CONSTRAINT IF EXISTS contas_tipo_check");
            jdbcTemplate.execute("ALTER TABLE contas DROP CONSTRAINT IF EXISTS contas_status_check");
        } catch (Exception e) {
            logger.warn("Aviso ao verificar constraints (pode ser ignorado se já removidas): {}", e.getMessage());
        }

        // 2. Carga inicial desativada para preservar dados existentes
        // Se desejar popular um banco vazio no futuro, descomente a lógica abaixo
        /*
        if (contaRepository.count() == 0) {
             System.out.println("Banco vazio detectado. Iniciando carga inicial...");
             // ... lógica de criação ...
        }
        */
        System.out.println("DataInitializer: Limpeza e carga automática desativadas. Preservando dados do banco.");
    }

    private List<Cliente> criarClientes() {
        return Arrays.asList(
            novoCliente("Ambev SA", "12.345.678/0001-01"),
            novoCliente("Amazon Brasil", "98.765.432/0001-99"),
            novoCliente("Google Cloud", "45.678.123/0001-44"),
            novoCliente("Imobiliária Aliança", "11.222.333/0001-55"),
            novoCliente("Posto Shell Matriz", "33.444.555/0001-66"),
            novoCliente("Padaria Central", "77.888.999/0001-77"),
            novoCliente("Paulo Henrique Consultor", "123.456.789-00"),
            novoCliente("Maria Silva Oliveira", "987.654.321-11"),
            novoCliente("Tech Solutions LTDA", "55.666.777/0001-88"),
            novoCliente("Mercado Livre", "00.111.222/0001-33")
        );
    }

    private Cliente novoCliente(String nome, String doc) {
        Cliente c = new Cliente();
        c.setNome(nome);
        c.setDocumento(doc);
        c.setEmail(nome.toLowerCase().replace(" ", ".") + "@email.com");
        return c;
    }

    private List<Conta> gerarContas(TipoConta tipo, StatusConta status, int qtd, List<Cliente> clientes) {
        List<Conta> contas = new ArrayList<>();
        String[] catDespesa = {"Aluguel", "Energia", "Suprimentos", "Impostos", "Manutenção", "Marketing"};
        String[] catReceita = {"Venda Produto", "Consultoria", "Assinatura SaaS", "Treinamento", "Licenciamento"};

        for (int i = 1; i <= qtd; i++) {
            Conta c = new Conta();
            c.setTipo(tipo);
            c.setStatus(status);
            
            // Descrição e Categoria
            if (tipo == TipoConta.DESPESA || tipo == TipoConta.PAGAR) {
                String cat = catDespesa[random.nextInt(catDespesa.length)];
                c.setCategoria(cat);
                c.setDescricao(cat + " - Lote " + i);
            } else {
                String cat = catReceita[random.nextInt(catReceita.length)];
                c.setCategoria(cat);
                c.setDescricao(cat + " - Cliente " + i);
            }

            // Cliente/Pessoa
            if (random.nextBoolean()) {
                c.setCliente(clientes.get(random.nextInt(clientes.size())));
                c.setPessoa(c.getCliente().getNome()); // Garante que pessoa não seja nulo
            } else {
                c.setPessoa("Pessoa Externa " + i);
            }

            c.setValor(new BigDecimal(500 + random.nextInt(9500)));
            c.setFormaPagamento(random.nextBoolean() ? "PIX" : "Boleto");
            c.setDataCriacao(LocalDate.now().minusDays(30 + random.nextInt(30)));

            // Lógica de Datas baseada no Status
            configurarDatasEStatus(c, status);

            contas.add(c);
        }
        return contas;
    }

    private void configurarDatasEStatus(Conta c, StatusConta status) {
        LocalDate hoje = LocalDate.now();

        switch (status) {
            case PENDENTE:
                c.setDataVencimento(hoje.plusDays(5 + random.nextInt(25)));
                c.setDataPagamentoRecebimento(null);
                c.setDataPrevistaRecebimento(c.getTipo() == TipoConta.RECEITA ? c.getDataVencimento() : null);
                break;
            case PAGO:
            case RECEBIDO:
                c.setDataVencimento(hoje.minusDays(random.nextInt(15)));
                c.setDataPagamentoRecebimento(c.getDataVencimento().plusDays(random.nextInt(2)));
                c.setDataPrevistaRecebimento(null);
                break;
            case VENCIDO:
                c.setDataVencimento(hoje.minusDays(5 + random.nextInt(30)));
                c.setDataPagamentoRecebimento(null);
                c.setDataPrevistaRecebimento(c.getTipo() == TipoConta.RECEITA ? c.getDataVencimento() : null);
                break;
            default:
                break;
        }
    }
}
