import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';

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
}

const FluxoCaixa = () => {
  const [fluxo, setFluxo] = useState<FluxoCaixaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    inicio: '',
    fim: '',
    contaFinanceiraId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.inicio) params.append('inicio', filtros.inicio);
      if (filtros.fim) params.append('fim', filtros.fim);
      if (filtros.contaFinanceiraId) params.append('contaFinanceiraId', filtros.contaFinanceiraId);

      const response = await api.get(`/fluxo-caixa?${params.toString()}`);
      setFluxo(response.data);
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-10 animate-fade-in p-4 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
          Fluxo de <span className="text-[#F97316]">Caixa</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Histórico de movimentações - CHORA &nbsp; CONTÁBIL &nbsp; ERP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 glass-card p-6 border-white/5 border-2">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500">Início</label>
          <input type="date" className="input-field" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500">Fim</label>
          <input type="date" className="input-field" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} />
        </div>
        <div className="flex items-end">
          <button onClick={fetchData} className="btn-primary w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <Search size={16} /> Filtrar
          </button>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden border-white/5 border-2 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#111827] border-b dark:border-white/5">
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Data</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Conta Original</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Origem/Destino</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {fluxo.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#F97316]/5 transition-all duration-300 group">
                  <td className="px-8 py-6 text-sm font-black text-slate-800 dark:text-slate-200 uppercase italic tracking-wider">{formatDate(item.data)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {item.tipo === 'RECEITA' ? 
                        <ArrowUpCircle className="text-emerald-500" size={18} /> : 
                        <ArrowDownCircle className="text-red-500" size={18} />
                      }
                      <span className="text-xs font-bold dark:text-white uppercase">{item.descricaoConta}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full dark:text-slate-300 border border-white/5">
                      {item.contaFinanceira}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-lg font-black text-right tracking-tighter italic ${item.tipo === 'RECEITA' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
              {fluxo.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Nenhuma movimentação registrada no período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixa;
