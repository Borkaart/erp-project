import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle } from 'lucide-react';
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

interface Conta {
  id: number;
  tipo: 'RECEBER' | 'PAGAR' | 'RECEITA' | 'DESPESA';
  descricao: string;
  categoria: string;
  pessoa: string;
  dataCriacao: string;
  dataVencimento: string;
  dataPagamentoRecebimento: string;
  dataPrevistaRecebimento?: string;
  valor: number;
  formaPagamento: string;
  status: 'PENDENTE' | 'PAGO' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
  observacoes: string;
}

const Contas = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialForm = {
    tipo: 'RECEBER' as 'RECEBER' | 'PAGAR' | 'RECEITA' | 'DESPESA',
    descricao: '',
    categoria: '',
    pessoa: '',
    dataVencimento: '',
    dataPrevistaRecebimento: '',
    valor: 0,
    formaPagamento: 'PIX',
    status: 'PENDENTE',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchContas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contas');
      setContas(res.data);
    } catch (error) {
      console.error('Erro ao buscar contas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, []);

  const handleOpenModal = (conta?: Conta) => {
    if (conta) {
      setEditingId(conta.id);
      setFormData({
        tipo: conta.tipo,
        descricao: conta.descricao,
        categoria: conta.categoria,
        pessoa: conta.pessoa,
        dataVencimento: conta.dataVencimento,
        dataPrevistaRecebimento: conta.dataPrevistaRecebimento || '',
        valor: conta.valor,
        formaPagamento: conta.formaPagamento,
        status: conta.status,
        observacoes: conta.observacoes || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handlePagarReceberRapido = async (conta: any) => {
    const isReceita = conta.tipo === 'RECEBER' || conta.tipo === 'RECEITA';
    const action = isReceita ? 'receber' : 'pagar';
    const confirmMsg = `Deseja confirmar o ${isReceita ? 'recebimento' : 'pagamento'} de "${conta.descricao}"?\n\nClique em OK para usar a data de HOJE ou digite uma data manual (AAAA-MM-DD):`;
    
    let manualDate = prompt(confirmMsg, '');
    
    if (manualDate === null) return; // Cancelou o prompt

    try {
      const payload = manualDate.trim() !== '' ? { data: manualDate.trim() } : {};
      await api.put(`/contas/${conta.id}/${action}`, payload);
      fetchContas();
      if (isModalOpen) setIsModalOpen(false);
      alert('Operação realizada com sucesso!');
    } catch (error) {
      console.error(`Erro ao processar ${action}`, error);
      alert(`Erro ao processar ${action}. Verifique a data ou se a conta já foi liquidada.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isReceita = formData.tipo === 'RECEBER' || formData.tipo === 'RECEITA';
      const dataToSubmit = {
        ...formData,
        dataPrevistaRecebimento: isReceita && formData.dataPrevistaRecebimento ? formData.dataPrevistaRecebimento : null
      };

      if (editingId) {
        await api.put(`/contas/${editingId}`, dataToSubmit);
      } else {
        await api.post('/contas', dataToSubmit);
      }
      setIsModalOpen(false);
      fetchContas();
    } catch (error) {
      console.error('Erro ao salvar conta', error);
      alert('Erro ao salvar conta.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await api.delete(`/contas/${id}`);
        fetchContas();
      } catch (error) {
        console.error('Erro ao excluir conta', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filtered = contas.filter(c => {
    const matchSearch = c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.pessoa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'TODOS' || c.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'PAGO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
      'RECEBIDO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
      'PENDENTE': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
      'VENCIDO': 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white font-black animate-pulse',
      'CANCELADO': 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300'
    };
    return <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-tighter font-bold shadow-sm ${colors[status] || colors['PENDENTE']}`}>{status}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight uppercase italic">Contas</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 shadow-glow-orange border border-white/20">
          <Plus size={20} strokeWidth={3} /> <span className="font-black uppercase tracking-widest text-xs">Nova Conta</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="glass-card p-5 flex items-center gap-3 flex-1 border-white/5 border-2 transition-all">
          <Search size={22} className="text-[#F97316]" strokeWidth={3} />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou cliente/fornecedor..." 
            className="bg-transparent border-none focus:outline-none w-full text-slate-800 dark:text-white font-bold placeholder-slate-500 uppercase text-xs tracking-widest"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="glass-card p-5 flex items-center gap-3 border-white/5 border-2 transition-all">
          <Filter size={22} className="text-[#F97316]" strokeWidth={3} />
          <select 
            className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-white font-black cursor-pointer uppercase text-xs tracking-widest"
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
          >
            <option value="TODOS" className="dark:bg-[#1F2937]">Todos os Tipos</option>
            <option value="RECEBER" className="dark:bg-[#1F2937]">Receitas</option>
            <option value="PAGAR" className="dark:bg-[#1F2937]">Despesas</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5 border-2 transition-all">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F97316]"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#111827] border-b dark:border-white/5">
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Descrição</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Pessoa</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Vencimento</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Valor</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filtered.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => handleOpenModal(c)}
                    className="hover:bg-slate-50 dark:hover:bg-[#F97316]/5 transition-all duration-300 group cursor-pointer"
                  >
                    <td className="px-6 py-5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-lg ${ (c.tipo === 'RECEBER' || c.tipo === 'RECEITA') ? 'bg-blue-500 shadow-blue-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                        {c.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{c.pessoa}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="dark:text-slate-200 font-black">{formatDate(c.dataVencimento)}</div>
                      {(c.tipo === 'RECEBER' || c.tipo === 'RECEITA') && c.dataPrevistaRecebimento && (
                        <div className="text-[9px] text-[#F97316] font-black uppercase tracking-tighter mt-1 bg-[#F97316]/10 px-1.5 py-0.5 rounded inline-block">Prev: {formatDate(c.dataPrevistaRecebimento)}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-slate-800 dark:text-white tracking-tighter italic">{formatCurrency(c.valor)}</td>
                    <td className="px-6 py-5">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-5 text-right space-x-1">
                      {(( (c.tipo === 'PAGAR' || c.tipo === 'DESPESA') && c.status !== 'PAGO') || ( (c.tipo === 'RECEBER' || c.tipo === 'RECEITA') && c.status !== 'RECEBIDO')) && c.status !== 'CANCELADO' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePagarReceberRapido(c); }} 
                          className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all transform hover:scale-125 hover:shadow-lg"
                          title={(c.tipo === 'RECEBER' || c.tipo === 'RECEITA') ? 'Receber agora' : 'Pagar agora'}
                        >
                          <CheckCircle size={20} strokeWidth={3}/>
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }} 
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-all transform hover:scale-125"
                      >
                        <Edit2 size={18} strokeWidth={3}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-all transform hover:scale-125"
                      >
                        <Trash2 size={18} strokeWidth={3}/>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Nenhuma conta encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-10 bg-white dark:bg-[#1F2937] my-8 border-white/10 border-2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accentOrange to-transparent opacity-50"></div>
            <h2 className="text-3xl font-black mb-8 dark:text-white tracking-tighter uppercase italic">{editingId ? 'Editar Conta' : 'Nova Conta'}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Tipo de Fluxo</label>
                  <select required className="input-field font-black uppercase text-xs tracking-widest" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as any})}>
                    <option value="RECEBER" className="dark:bg-[#1F2937]">Receita</option>
                    <option value="PAGAR" className="dark:bg-[#1F2937]">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Status Atual</label>
                  <select required className="input-field font-black uppercase text-xs tracking-widest" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="PENDENTE" className="dark:bg-[#1F2937]">Pendente</option>
                    <option value="PAGO" className="dark:bg-[#1F2937]">Pago</option>
                    <option value="RECEBIDO" className="dark:bg-[#1F2937]">Recebido</option>
                    <option value="VENCIDO" className="dark:bg-[#1F2937]">Vencido</option>
                    <option value="CANCELADO" className="dark:bg-[#1F2937]">Cancelado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Descrição da Operação</label>
                  <input required type="text" className="input-field font-bold uppercase text-xs tracking-widest" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Categoria</label>
                  <input required type="text" className="input-field font-bold uppercase text-xs tracking-widest" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Entidade / Pessoa</label>
                  <input required type="text" className="input-field font-bold uppercase text-xs tracking-widest" value={formData.pessoa} onChange={e => setFormData({...formData, pessoa: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Data de Vencimento</label>
                  <input required type="date" className="input-field dark:[color-scheme:dark] font-black text-xs tracking-widest" value={formData.dataVencimento} onChange={e => setFormData({...formData, dataVencimento: e.target.value})} />
                </div>
                {formData.tipo === 'RECEBER' && (
                  <div>
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Previsão de Crédito</label>
                    <input type="date" className="input-field dark:[color-scheme:dark] font-black text-xs tracking-widest border-accentOrange/30" value={formData.dataPrevistaRecebimento} onChange={e => setFormData({...formData, dataPrevistaRecebimento: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Valor Operacional (R$)</label>
                  <input required type="number" step="0.01" className="input-field font-black text-lg tracking-tighter text-accentOrange italic" value={formData.valor} onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Forma de Liquidação</label>
                  <input required type="text" className="input-field font-bold uppercase text-xs tracking-widest" value={formData.formaPagamento} onChange={e => setFormData({...formData, formaPagamento: e.target.value})} />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-4 pt-8 border-t border-white/5 mt-10">
                <button type="button" className="btn-secondary px-6 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>Fechar</button>
                {editingId && (
                  (() => {
                    const isReceita = formData.tipo === 'RECEBER' || formData.tipo === 'RECEITA';
                    const isDespesa = formData.tipo === 'PAGAR' || formData.tipo === 'DESPESA';
                    const canLiquidar = (isDespesa && formData.status !== 'PAGO') || (isReceita && formData.status !== 'RECEBIDO');
                    
                    if (canLiquidar && formData.status !== 'CANCELADO') {
                      return (
                        <button 
                          type="button" 
                          onClick={() => handlePagarReceberRapido({ id: editingId, tipo: formData.tipo, descricao: formData.descricao })}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all transform hover:-translate-y-1"
                        >
                          {isReceita ? 'Confirmar Recebimento' : 'Confirmar Pagamento'}
                        </button>
                      );
                    }
                    return null;
                  })()
                )}
                <button type="submit" className="btn-primary px-10 font-black uppercase tracking-widest text-[10px] shadow-glow-orange border border-white/20">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contas;
