import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowUpCircle, ArrowDownCircle, Search, Save, X } from 'lucide-react';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  } catch {
    return dateString;
  }
};

interface FluxoCaixaItem {
  id: number;
  data: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  contaFinanceira: string;
  descricaoConta: string;
  saldoAcumulado: number;
}

interface FluxoCaixaRelatorio {
  saldoInicial: number;
  saldoFinal: number;
  itens: FluxoCaixaItem[];
}

const FluxoCaixa = () => {
  const [relatorio, setRelatorio] = useState<FluxoCaixaRelatorio>({ saldoInicial: 0, saldoFinal: 0, itens: [] });
  const [loading, setLoading] = useState(true);
  const [editandoSaldo, setEditandoSaldo] = useState(false);
  const [novoSaldoManual, setNovoSaldoManual] = useState<string>('');
  const [filtros, setFiltros] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    contaFinanceiraId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.inicio) params.append('inicio', filtros.inicio);
      if (filtros.fim) params.append('fim', filtros.fim);
      if (filtros.contaFinanceiraId) params.append('contaFinanceiraId', filtros.contaFinanceiraId);

      const response = await api.get(`/contas/fluxo-caixa?${params.toString()}`);
      setRelatorio(response.data);
      setNovoSaldoManual(response.data.saldoInicial.toString());
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarSaldoManual = async () => {
    try {
      const dataInicio = new Date(filtros.inicio);
      await api.post('/contas/saldo-inicial', {
        mes: dataInicio.getMonth() + 1,
        ano: dataInicio.getFullYear(),
        saldoInicial: parseFloat(novoSaldoManual)
      });
      setEditandoSaldo(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar saldo inicial', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="section-title mb-0">Fluxo de Caixa</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <label className="label-text">Início</label>
          <input type="date" className="input-field" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="label-text">Fim</label>
          <input type="date" className="input-field" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} />
        </div>
        
        <div className="card p-4 flex flex-col justify-center">
          <p className="label-text mb-1">Saldo Inicial</p>
          <div className="flex items-center gap-2">
            {editandoSaldo ? (
              <div className="flex gap-1 w-full">
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field h-8 text-[14px] font-bold text-accent-light dark:text-accent-dark" 
                  value={novoSaldoManual} 
                  onChange={e => setNovoSaldoManual(e.target.value)}
                  autoFocus
                />
                <button onClick={salvarSaldoManual} className="p-1.5 bg-revenue-light text-white rounded-lg"><Save size={14} /></button>
                <button onClick={() => setEditandoSaldo(false)} className="p-1.5 bg-border-light dark:bg-border-dark text-text-primary-light dark:text-text-primary-dark rounded-lg"><X size={14} /></button>
              </div>
            ) : (
              <div 
                className="text-[18px] font-bold text-accent-light dark:text-accent-dark cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setEditandoSaldo(true)}
              >
                {formatCurrency(relatorio.saldoInicial)}
              </div>
            )}
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-revenue-light dark:border-l-revenue-dark">
          <p className="label-text mb-1">Saldo Final</p>
          <div className="text-[18px] font-bold text-revenue-light dark:text-revenue-dark">
            {formatCurrency(relatorio.saldoFinal)}
          </div>
        </div>

        <div className="flex items-end">
          <button onClick={fetchData} className="btn-primary w-full flex items-center justify-center gap-2">
            <Search size={18} /> Filtrar
          </button>
        </div>
      </div>
      
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-light dark:border-accent-dark"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Data</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Conta Financeira</th>
                  <th className="table-header text-right">Valor</th>
                  <th className="table-header text-right">Saldo Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
                {relatorio.itens.map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="table-cell font-medium">{formatDate(item.data)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {item.tipo === 'RECEITA' ? 
                          <ArrowUpCircle className="text-revenue-light dark:text-revenue-dark" size={16} /> : 
                          <ArrowDownCircle className="text-expense-light dark:text-expense-dark" size={16} />
                        }
                        <span className="font-medium">{item.descricaoConta}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-0.5 rounded-md bg-border-light dark:bg-border-dark text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                        {item.contaFinanceira}
                      </span>
                    </td>
                    <td className={`table-cell text-right font-bold ${item.tipo === 'RECEITA' ? 'text-revenue-light dark:text-revenue-dark' : 'text-expense-light dark:text-expense-dark'}`}>
                      {item.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(item.valor)}
                    </td>
                    <td className="table-cell text-right font-bold text-text-secondary-light dark:text-text-secondary-dark">
                      {formatCurrency(item.saldoAcumulado)}
                    </td>
                  </tr>
                ))}
                {relatorio.itens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary-light dark:text-text-secondary-dark italic text-sm">
                      Nenhuma movimentação registrada no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FluxoCaixa;
