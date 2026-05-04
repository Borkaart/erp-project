package com.financeiro.app.config;

import com.financeiro.app.enums.FormaPagamento;
import com.financeiro.app.enums.StatusConta;
import com.financeiro.app.enums.TipoConta;
import com.financeiro.app.model.*;
import com.financeiro.app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final ContaRepository contaRepository;
    private final BaixaRepository baixaRepository;
    private final ContaFinanceiraRepository contaFinanceiraRepository;
    private final SaldoMensalRepository saldoMensalRepository;

    public DataInitializer(ContaRepository contaRepository,
                           BaixaRepository baixaRepository,
                           ContaFinanceiraRepository contaFinanceiraRepository,
                           SaldoMensalRepository saldoMensalRepository) {
        this.contaRepository = contaRepository;
        this.baixaRepository = baixaRepository;
        this.contaFinanceiraRepository = contaFinanceiraRepository;
        this.saldoMensalRepository = saldoMensalRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Verificar se já existem dados em Abril/2026
        long contasAbril = contaRepository.findAll().stream()
                .filter(c -> c.getDataVencimento().getMonthValue() == 4 && c.getDataVencimento().getYear() == 2026)
                .count();

        if (contasAbril == 0) {
            System.out.println("Iniciando carga de dados de Abril/2026...");

            // 1. Garantir Contas Financeiras
            ContaFinanceira caixa = contaFinanceiraRepository.findByNome("Caixa")
                    .orElseGet(() -> {
                        ContaFinanceira c = new ContaFinanceira("Caixa");
                        c.setSaldoAtual(BigDecimal.ZERO);
                        return contaFinanceiraRepository.save(c);
                    });

            ContaFinanceira banco = contaFinanceiraRepository.findByNome("Banco do Brasil")
                    .orElseGet(() -> {
                        ContaFinanceira c = new ContaFinanceira("Banco do Brasil");
                        c.setSaldoAtual(BigDecimal.ZERO);
                        return contaFinanceiraRepository.save(c);
                    });

            // 2. Definir Saldo Inicial de Abril (Exemplo: 5000.00)
            if (saldoMensalRepository.findByMesAndAno(4, 2026).isEmpty()) {
                saldoMensalRepository.save(new SaldoMensal(4, 2026, new BigDecimal("5000.00")));
            }

            // 3. Criar Receitas de Abril
            criarContaEBaixa("Venda de Produtos", TipoConta.RECEITA, "Vendas", "Cliente ABC", 
                LocalDate.of(2026, 4, 5), new BigDecimal("1200.00"), FormaPagamento.PIX, banco);
            
            criarContaEBaixa("Serviço de Consultoria", TipoConta.RECEITA, "Serviços", "Empresa XYZ", 
                LocalDate.of(2026, 4, 15), new BigDecimal("3500.00"), FormaPagamento.PIX, banco);

            criarContaEBaixa("Venda Pequena", TipoConta.RECEITA, "Vendas", "Cliente Final", 
                LocalDate.of(2026, 4, 20), new BigDecimal("150.00"), FormaPagamento.DINHEIRO, caixa);

            // 4. Criar Despesas de Abril
            criarContaEBaixa("Aluguel Escritório", TipoConta.DESPESA, "Infraestrutura", "Imobiliária", 
                LocalDate.of(2026, 4, 10), new BigDecimal("2000.00"), FormaPagamento.BOLETO_BANCARIO, banco);

            criarContaEBaixa("Internet e Telefone", TipoConta.DESPESA, "Utilidades", "Operadora", 
                LocalDate.of(2026, 4, 12), new BigDecimal("250.00"), FormaPagamento.PIX, banco);

            criarContaEBaixa("Material de Limpeza", TipoConta.DESPESA, "Suprimentos", "Mercado Local", 
                LocalDate.of(2026, 4, 18), new BigDecimal("85.00"), FormaPagamento.DINHEIRO, caixa);

            criarContaEBaixa("Energia Elétrica", TipoConta.DESPESA, "Utilidades", "Concessionária", 
                LocalDate.of(2026, 4, 25), new BigDecimal("450.00"), FormaPagamento.BOLETO_BANCARIO, banco);

            System.out.println("Carga de dados de Abril concluída!");
        }
    }

    private void criarContaEBaixa(String desc, TipoConta tipo, String cat, String pessoa, 
                                 LocalDate data, BigDecimal valor, FormaPagamento forma, 
                                 ContaFinanceira cf) {
        Conta conta = new Conta();
        conta.setDescricao(desc);
        conta.setTipo(tipo);
        conta.setCategoria(cat);
        conta.setPessoa(pessoa);
        conta.setDataVencimento(data);
        conta.setDataCriacao(data.minusDays(5));
        conta.setValorTotal(valor);
        conta.setValorPago(valor);
        conta.setStatus(StatusConta.PAGO);
        conta = contaRepository.save(conta);

        Baixa baixa = new Baixa();
        baixa.setConta(conta);
        baixa.setValor(valor);
        baixa.setDataPagamento(data);
        baixa.setFormaPagamento(forma);
        baixa.setContaFinanceira(cf);
        baixaRepository.save(baixa);

        // Garantir que o saldo não é nulo antes de somar/subtrair
        BigDecimal saldoAtual = cf.getSaldoAtual() != null ? cf.getSaldoAtual() : BigDecimal.ZERO;

        // Atualizar saldo da conta financeira
        if (tipo == TipoConta.RECEITA) {
            cf.setSaldoAtual(saldoAtual.add(valor));
        } else {
            cf.setSaldoAtual(saldoAtual.subtract(valor));
        }
        contaFinanceiraRepository.save(cf);
    }

    private void criarContaPendente(String desc, TipoConta tipo, String cat, String pessoa, 
                                   LocalDate data, BigDecimal valor) {
        Conta conta = new Conta();
        conta.setDescricao(desc);
        conta.setTipo(tipo);
        conta.setCategoria(cat);
        conta.setPessoa(pessoa);
        conta.setDataVencimento(data);
        conta.setDataCriacao(LocalDate.now());
        conta.setValorTotal(valor);
        conta.setValorPago(BigDecimal.ZERO);
        conta.setStatus(StatusConta.PENDENTE);
        contaRepository.save(conta);
    }
}
