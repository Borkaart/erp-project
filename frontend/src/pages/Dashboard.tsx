import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Resumo {
  totalAPagar: number;
  totalAReceber: number;
  totalPago: number;
  totalRecebido: number;
  previsaoPagar15Dias: number;
  previsaoReceber15Dias: number;
  previsaoPagar30Dias: number;
  previsaoReceber30Dias: number;
}

interface CategoriaResumo {
  categoria: string;
  totalEntradas: number;
  totalSaidas: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

const Dashboard = () => {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumoRes, categoriasRes] = await Promise.all([
          api.get('/resumo'),
          api.get('/categorias/resumo')
        ]);
        setResumo(resumoRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard', error);
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

  const cards = [
    { title: 'Total a Receber', value: resumo?.totalAReceber || 0, icon: ArrowUpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Total a Pagar', value: resumo?.totalAPagar || 0, icon: ArrowDownCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Total Recebido', value: resumo?.totalRecebido || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Pago', value: resumo?.totalPago || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const pieData = categorias.map(c => ({ name: c.categoria, value: c.totalSaidas })).filter(c => c.value > 0);

  const DASHBOARD_COLORS = ['#F97316', '#6366f1', '#10b981', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-10 animate-fade-in p-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">
          Visão <span className="text-[#F97316]">Geral</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Relatório de performance financeira - CHORA &nbsp; CONTÁBIL &nbsp; ERP</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card p-8 flex items-center justify-between border-white/5 border-2 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter italic">
                {formatCurrency(card.value)}
              </h3>
            </div>
            <div className={`p-5 rounded-2xl ${card.bg} border border-white/5 relative z-10 shadow-inner`}>
              <card.icon size={32} className={card.color} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card p-10 border-white/5 border-2 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 via-transparent to-transparent"></div>
          <h3 className="text-xl font-black mb-8 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
            <ArrowUpCircle className="text-[#F97316]" size={28} strokeWidth={3} /> 
            <span>Projeção de Entradas</span>
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-[#0D1117]/80 rounded-2xl border border-white/5 shadow-inner group hover:border-[#F97316]/30 transition-colors">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Próximos 15 dias</span>
              <span className="text-2xl font-black text-[#F97316] tracking-tighter italic">{formatCurrency(resumo?.previsaoReceber15Dias || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-[#0D1117]/80 rounded-2xl border border-white/5 shadow-inner group hover:border-[#F97316]/30 transition-colors">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Próximos 30 dias</span>
              <span className="text-2xl font-black text-[#F97316] tracking-tighter italic">{formatCurrency(resumo?.previsaoReceber30Dias || 0)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 border-2 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-transparent to-transparent"></div>
          <h3 className="text-xl font-black mb-8 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
            <ArrowDownCircle className="text-red-500" size={28} strokeWidth={3} /> 
            <span>Projeção de Saídas</span>
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-[#0D1117]/80 rounded-2xl border border-white/5 shadow-inner group hover:border-red-500/30 transition-colors">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Próximos 15 dias</span>
              <span className="text-2xl font-black text-red-500 tracking-tighter italic">{formatCurrency(resumo?.previsaoPagar15Dias || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-[#0D1117]/80 rounded-2xl border border-white/5 shadow-inner group hover:border-red-500/30 transition-colors">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Próximos 30 dias</span>
              <span className="text-2xl font-black text-red-500 tracking-tighter italic">{formatCurrency(resumo?.previsaoPagar30Dias || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 border-white/5 border-2 shadow-2xl">
          <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter italic">Performance por Categoria</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.1} vertical={false} />
                <XAxis dataKey="categoria" stroke="#94a3b8" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={900} tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '2px solid #F97316', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#9CA3AF', fontWeight: 800, marginBottom: '4px' }}
                  cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Bar dataKey="totalEntradas" name="Entradas" fill="#F97316" radius={[8, 8, 0, 0]} barSize={30} />
                <Bar dataKey="totalSaidas" name="Saídas" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 border-2 shadow-2xl relative">
          <h3 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter italic">Distribuição de Despesas</h3>
          <div className="h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '2px solid #F97316', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
              </PieChart>
            </ResponsiveContainer>
            {pieData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Sem dados operacionais</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
