import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Resumo {
  totalAPagar: number;
  totalAReceber: number;
  totalPago: number;
  totalRecebido: number;
  previsaoPagar15Dias: number;
  previsaoReceber15Dias: number;
  previsaoPagar30Dias: number;
  previsaoReceber30Dias: number;
  receitaVencida: number;
  despesaVencida: number;
}

interface CategoriaResumo {
  categoria: string;
  totalEntradas: number;
  totalSaidas: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumoRes, categoriasRes] = await Promise.all([
          api.get('/contas/resumo'),
          api.get('/contas/resumo-categorias')
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
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-light dark:border-accent-dark"></div></div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const metricCards = [
    { 
      title: 'Total a Receber', 
      value: resumo?.totalAReceber || 0, 
      icon: ArrowUpCircle, 
      color: 'text-revenue-light dark:text-revenue-dark', 
      bg: 'bg-revenue-light/12 dark:bg-revenue-dark/12', 
      filter: { tipo: 'RECEITA', status: 'PENDENTE' } 
    },
    { 
      title: 'Total a Pagar', 
      value: resumo?.totalAPagar || 0, 
      icon: ArrowDownCircle, 
      color: 'text-expense-light dark:text-expense-dark', 
      bg: 'bg-expense-light/12 dark:bg-expense-dark/12', 
      filter: { tipo: 'DESPESA', status: 'PENDENTE' } 
    },
    { 
      title: 'Total Recebido', 
      value: resumo?.totalRecebido || 0, 
      icon: CheckCircle, 
      color: 'text-revenue-light dark:text-revenue-dark', 
      bg: 'bg-revenue-light/12 dark:bg-revenue-dark/12', 
      filter: { tipo: 'RECEITA', status: 'PAGO' } 
    },
    { 
      title: 'Total Pago', 
      value: resumo?.totalPago || 0, 
      icon: Clock, 
      color: 'text-accent-light dark:text-accent-dark', 
      bg: 'bg-accent-light/12 dark:bg-accent-dark/12', 
      filter: { tipo: 'DESPESA', status: 'PAGO' } 
    },
  ];

  const pieData = categorias.map(c => ({ name: c.categoria, value: c.totalSaidas })).filter(c => c.value > 0);
  const PIE_COLORS = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B'];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="section-title">Visão Geral</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate('/contas', { state: card.filter })}
            className="card flex items-center gap-4 cursor-pointer hover:translate-y-[-2px] transition-transform"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="label-text">{card.title}</p>
              <h3 className="metric-value">{formatCurrency(card.value)}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(resumo?.receitaVencida || 0) > 0 && (
          <div className="bg-expense-light/10 dark:bg-expense-dark/10 border border-expense-light/20 dark:border-expense-dark/20 p-4 rounded-[14px] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-expense-light dark:text-expense-dark uppercase tracking-wider">Receitas Vencidas (Atraso)</p>
              <h3 className="text-[20px] font-bold text-expense-light dark:text-expense-dark">{formatCurrency(resumo?.receitaVencida || 0)}</h3>
            </div>
            <TrendingUp size={24} className="text-expense-light dark:text-expense-dark" />
          </div>
        )}
        {(resumo?.despesaVencida || 0) > 0 && (
          <div className="bg-expense-light/10 dark:bg-expense-dark/10 border border-expense-light/20 dark:border-expense-dark/20 p-4 rounded-[14px] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-expense-light dark:text-expense-dark uppercase tracking-wider">Despesas Vencidas (A Pagar)</p>
              <h3 className="text-[20px] font-bold text-expense-light dark:text-expense-dark">{formatCurrency(resumo?.despesaVencida || 0)}</h3>
            </div>
            <TrendingDown size={24} className="text-expense-light dark:text-expense-dark" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpCircle className="text-revenue-light dark:text-revenue-dark" size={18} />
            <h3 className="section-title mb-0">Projeção de Entradas</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="label-text py-2">Período</th>
                <th className="label-text py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
              <tr 
                onClick={() => navigate('/contas', { state: { tipo: 'RECEITA', status: 'PENDENTE', vencimento: '15DIAS' } })}
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <td className="body-text py-3">Próximos 15 dias</td>
                <td className="text-[16px] font-semibold text-revenue-light dark:text-revenue-dark py-3 text-right">
                  {formatCurrency(resumo?.previsaoReceber15Dias || 0)}
                </td>
              </tr>
              <tr 
                onClick={() => navigate('/contas', { state: { tipo: 'RECEITA', status: 'PENDENTE', vencimento: '30DIAS' } })}
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <td className="body-text py-3">Próximos 30 dias</td>
                <td className="text-[16px] font-semibold text-revenue-light dark:text-revenue-dark py-3 text-right">
                  {formatCurrency(resumo?.previsaoReceber30Dias || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <ArrowDownCircle className="text-expense-light dark:text-expense-dark" size={18} />
            <h3 className="section-title mb-0">Projeção de Saídas</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="label-text py-2">Período</th>
                <th className="label-text py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
              <tr 
                onClick={() => navigate('/contas', { state: { tipo: 'DESPESA', status: 'PENDENTE', vencimento: '15DIAS' } })}
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <td className="body-text py-3">Próximos 15 dias</td>
                <td className="text-[16px] font-semibold text-expense-light dark:text-expense-dark py-3 text-right">
                  {formatCurrency(resumo?.previsaoPagar15Dias || 0)}
                </td>
              </tr>
              <tr 
                onClick={() => navigate('/contas', { state: { tipo: 'DESPESA', status: 'PENDENTE', vencimento: '30DIAS' } })}
                className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <td className="body-text py-3">Próximos 30 dias</td>
                <td className="text-[16px] font-semibold text-expense-light dark:text-expense-dark py-3 text-right">
                  {formatCurrency(resumo?.previsaoPagar30Dias || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title mb-6">Performance por Categoria</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorias} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A38' : '#E8E8EE'} vertical={false} />
                <XAxis dataKey="categoria" stroke="#8B8B9E" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#8B8B9E" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1A1A24' : '#FFFFFF', 
                    border: `1px solid ${theme === 'dark' ? '#2A2A38' : '#E8E8EE'}`, 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: theme === 'dark' ? '#F4F4F6' : '#18181B'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#F4F4F6' : '#18181B' }}
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Bar dataKey="totalEntradas" name="Entradas" fill={theme === 'dark' ? '#818CF8' : '#6366F1'} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="totalSaidas" name="Saídas" fill={theme === 'dark' ? '#FB7185' : '#F43F5E'} radius={[4, 4, 0, 0]} barSize={20} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card relative">
          <h3 className="section-title mb-6">Distribuição de Despesas</h3>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1A1A24' : '#FFFFFF', 
                    border: `1px solid ${theme === 'dark' ? '#2A2A38' : '#E8E8EE'}`, 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: theme === 'dark' ? '#F4F4F6' : '#18181B'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#F4F4F6' : '#18181B' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            {pieData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="label-text">Sem dados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
