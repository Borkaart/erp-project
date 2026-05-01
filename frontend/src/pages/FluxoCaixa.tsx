import { useEffect, useState } from 'react';
import { api } from '../services/api';

// Usaremos fallback caso date-fns não seja instalado manualmente depois
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
  data: string;
  entradas: number;
  saidas: number;
  saldoAcumulado: number;
}

const FluxoCaixa = () => {
  const [fluxo, setFluxo] = useState<FluxoCaixaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/fluxo-caixa');
        setFluxo(response.data);
      } catch (error) {
        console.error('Erro ao carregar fluxo de caixa', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div></div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-10 animate-fade-in p-4 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
          Fluxo de <span className="text-[#F97316]">Caixa</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Histórico e projeção de liquidez - CHORA &nbsp; CONTÁBIL &nbsp; ERP</p>
      </div>
      
      <div className="glass-card overflow-hidden border-white/5 border-2 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#111827] border-b dark:border-white/5">
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Data</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Entradas</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Saídas</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {fluxo.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-[#F97316]/5 transition-all duration-300 group">
                  <td className="px-8 py-6 text-sm font-black text-slate-800 dark:text-slate-200 uppercase italic tracking-wider">{formatDate(item.data)}</td>
                  <td className="px-8 py-6 text-sm text-emerald-500 font-black text-right italic">+{formatCurrency(item.entradas)}</td>
                  <td className="px-8 py-6 text-sm text-red-500 font-black text-right italic">-{formatCurrency(item.saidas)}</td>
                  <td className={`px-8 py-6 text-lg font-black text-right tracking-tighter italic ${item.saldoAcumulado >= 0 ? 'text-[#F97316]' : 'text-red-600'}`}>
                    {formatCurrency(item.saldoAcumulado)}
                  </td>
                </tr>
              ))}
              {fluxo.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Nenhum dado operacional registrado.</td>
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
