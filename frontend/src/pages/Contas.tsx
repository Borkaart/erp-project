import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle, CreditCard } from 'lucide-react';
import { api } from '../services/api';

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
  tipo: 'RECEITA' | 'DESPESA';
  descricao: string;
  categoria: string;
  pessoa: string;
  dataCriacao: string;
  dataVencimento: string;
  valorTotal: number;
  valorPago: number;
  saldoRestante: number;
  status: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'VENCIDO';
  observacoes: string;
  grupoId?: number;
}

const Contas = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);

  const initialForm = {
    tipo: 'RECEITA' as 'RECEITA' | 'DESPESA',
    descricao: '',
    categoria: '',
    pessoa: '',
    dataVencimento: '',
    valorTotal: 0,
    observacoes: '',
    quantidadeParcelas: 1
  };

  const initialBaixaForm = {
    valor: 0,
    dataPagamento: new Date().toISOString().split('T')[0],
    formaPagamento: 'PIX'
  };

  const [formData, setFormData] = useState(initialForm);
  const [baixaFormData, setBaixaFormData] = useState(initialBaixaForm);

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
        valorTotal: conta.valorTotal,
        observacoes: conta.observacoes || '',
        quantidadeParcelas: 1
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleOpenBaixaModal = (conta: Conta) => {
    setSelectedConta(conta);
    setBaixaFormData({
      ...initialBaixaForm,
      valor: conta.saldoRestante
    });
    setIsBaixaModalOpen(true);
  };

  const handleBaixaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConta) return;

    try {
      await api.post(`/contas/${selectedConta.id}/baixas`, baixaFormData);
      setIsBaixaModalOpen(false);
      fetchContas();
      alert('Baixa realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao realizar baixa', error);
      alert('Erro ao realizar baixa. Verifique se o valor é maior que o saldo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/contas/${editingId}`, formData);
      } else {
        await api.post('/contas', formData);
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
    const desc = c.descricao || '';
    const pess = c.pessoa || '';
    const matchSearch = desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        pess.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'TODOS' || c.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'PAGO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
      'PARCIAL': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
      'PENDENTE': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
      'VENCIDO': 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white font-black animate-pulse'
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
            <option value="RECEITA" className="dark:bg-[#1F2937]">Receitas</option>
            <option value="DESPESA" className="dark:bg-[#1F2937]">Despesas</option>
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
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Total</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Saldo</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filtered.map(c => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50 dark:hover:bg-[#F97316]/5 transition-all duration-300 group cursor-pointer"
                  >
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-lg ${ (c.tipo === 'RECEITA') ? 'bg-blue-500 shadow-blue-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                        {c.descricao}
                      </div>
                    </td>
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{c.pessoa}</td>
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="dark:text-slate-200 font-black">{formatDate(c.dataVencimento)}</div>
                    </td>
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5 text-sm font-black text-slate-800 dark:text-white tracking-tighter italic text-right">{formatCurrency(c.valorTotal)}</td>
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5 text-sm font-black text-[#F97316] tracking-tighter italic text-right">{formatCurrency(c.saldoRestante)}</td>
                    <td onClick={() => handleOpenModal(c)} className="px-6 py-5">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-5 text-right space-x-1">
                      {c.status !== 'PAGO' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenBaixaModal(c); }} 
                          className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all transform hover:scale-125 hover:shadow-lg"
                          title="Realizar Pagamento/Recebimento"
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
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Nenhuma conta encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Baixa */}
      {isBaixaModalOpen && selectedConta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]/90 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-md p-8 bg-white dark:bg-[#1F2937] border-white/10 border-2 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 dark:text-white uppercase italic">Realizar Baixa</h2>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase">Conta</p>
              <p className="text-lg font-black dark:text-white italic">{selectedConta.descricao}</p>
              <p className="text-[10px] font-black text-[#F97316] uppercase mt-2">Saldo Restante: {formatCurrency(selectedConta.saldoRestante)}</p>
            </div>
            <form onSubmit={handleBaixaSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-500">Valor da Baixa</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="input-field font-black italic" 
                  value={baixaFormData.valor} 
                  onChange={e => setBaixaFormData({...baixaFormData, valor: parseFloat(e.target.value)})}
                  max={selectedConta.saldoRestante}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-500">Data do Pagamento</label>
                <input 
                  type="date" 
                  required 
                  className="input-field font-black" 
                  value={baixaFormData.dataPagamento} 
                  onChange={e => setBaixaFormData({...baixaFormData, dataPagamento: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-500">Forma de Pagamento</label>
                <select 
                  className="input-field font-black uppercase text-xs" 
                  value={baixaFormData.formaPagamento} 
                  onChange={e => setBaixaFormData({...baixaFormData, formaPagamento: e.target.value})}
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="BOLETO_BANCARIO">Boleto Bancário</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsBaixaModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <CreditCard size={18} /> Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Conta */}
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
                    <option value="RECEITA" className="dark:bg-[#1F2937]">Receita</option>
                    <option value="DESPESA" className="dark:bg-[#1F2937]">Despesa</option>
                  </select>
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Parcelamento</label>
                    <select className="input-field font-black uppercase text-xs tracking-widest" value={formData.quantidadeParcelas} onChange={e => setFormData({...formData, quantidadeParcelas: parseInt(e.target.value)})}>
                      <option value="1">À Vista</option>
                      {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x Parcelas</option>)}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Descrição</label>
                  <input required type="text" className="input-field font-black italic" placeholder="EX: VENDA DE PRODUTOS" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Cliente / Fornecedor</label>
                  <input required type="text" className="input-field font-black" placeholder="NOME DA PESSOA" value={formData.pessoa} onChange={e => setFormData({...formData, pessoa: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Categoria</label>
                  <input required type="text" className="input-field font-black" placeholder="EX: VENDAS" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Valor {formData.quantidadeParcelas > 1 ? 'Total' : ''}</label>
                  <input required type="number" step="0.01" className="input-field font-black italic" value={formData.valorTotal} onChange={e => setFormData({...formData, valorTotal: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Vencimento {formData.quantidadeParcelas > 1 ? '(1┬¬ Parcela)' : ''}</label>
                  <input required type="date" className="input-field font-black" value={formData.dataVencimento} onChange={e => setFormData({...formData, dataVencimento: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-slate-500">Observações</label>
                  <textarea className="input-field min-h-[100px] font-bold" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-8 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                <button type="submit" className="btn-primary px-10 shadow-glow-orange border border-white/20 font-black uppercase tracking-widest text-[10px]">Salvar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contas;
