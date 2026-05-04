import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, CreditCard, X } from 'lucide-react';
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
  const location = useLocation();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterVencimento, setFilterVencimento] = useState('TODOS');
  
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

  useEffect(() => {
    if (location.state) {
      const { tipo, status, vencimento } = location.state;
      if (tipo) setFilterTipo(tipo);
      if (status) setFilterStatus(status);
      if (vencimento) setFilterVencimento(vencimento);
    }
  }, [location.state]);

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
    
    let matchStatus = true;
    if (filterStatus === 'PENDENTE') {
      matchStatus = c.status === 'PENDENTE' || c.status === 'PARCIAL' || c.status === 'VENCIDO';
    } else if (filterStatus === 'PAGO') {
      matchStatus = c.status === 'PAGO';
    } else if (filterStatus !== 'TODOS') {
      matchStatus = c.status === filterStatus;
    }

    let matchVencimento = true;
    if (filterVencimento !== 'TODOS') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataVenc = new Date(c.dataVencimento);
      dataVenc.setHours(0, 0, 0, 0);
      
      const diffTime = dataVenc.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterVencimento === '15DIAS') {
        matchVencimento = diffDays >= 0 && diffDays <= 15;
      } else if (filterVencimento === '30DIAS') {
        matchVencimento = diffDays >= 0 && diffDays <= 30;
      }
    }

    return matchSearch && matchTipo && matchStatus && matchVencimento;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'PAGO': 'bg-revenue-light/10 text-revenue-light dark:bg-revenue-dark/10 dark:text-revenue-dark',
      'PARCIAL': 'bg-accent-light/10 text-accent-light dark:bg-accent-dark/10 dark:text-accent-dark',
      'PENDENTE': 'bg-text-secondary-light/10 text-text-secondary-light dark:bg-text-secondary-dark/10 dark:text-text-secondary-dark',
      'VENCIDO': 'bg-expense-light/10 text-expense-light dark:bg-expense-dark/10 dark:text-expense-dark font-semibold'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colors[status] || colors['PENDENTE']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="section-title mb-0">Gestão de Contas</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark" />
          <input 
            type="text" 
            placeholder="Buscar lançamentos..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="input-field cursor-pointer"
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
        >
          <option value="TODOS">Todos os Tipos</option>
          <option value="RECEITA">Receitas</option>
          <option value="DESPESA">Despesas</option>
        </select>

        <select 
          className="input-field cursor-pointer"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="TODOS">Todos os Status</option>
          <option value="PENDENTE">Pendente / Parcial</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
        </select>

        <div className="flex items-center gap-4">
          {(filterTipo !== 'TODOS' || filterStatus !== 'TODOS' || filterVencimento !== 'TODOS') && (
            <button 
              onClick={() => { setFilterTipo('TODOS'); setFilterStatus('TODOS'); setFilterVencimento('TODOS'); }}
              className="text-[11px] font-semibold uppercase text-expense-light dark:text-expense-dark hover:brightness-110 flex items-center gap-1"
            >
              <X size={14} /> Limpar Filtros
            </button>
          )}
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
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Pessoa</th>
                  <th className="table-header">Vencimento</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Saldo</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="table-cell font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${ (c.tipo === 'RECEITA') ? 'bg-revenue-light dark:bg-revenue-dark' : 'bg-expense-light dark:bg-expense-dark'}`}></div>
                        {c.descricao}
                      </div>
                    </td>
                    <td className="table-cell text-text-secondary-light dark:text-text-secondary-dark">{c.pessoa}</td>
                    <td className="table-cell font-medium">{formatDate(c.dataVencimento)}</td>
                    <td className="table-cell text-right font-semibold">{formatCurrency(c.valorTotal)}</td>
                    <td className="table-cell text-right font-semibold text-accent-light dark:text-accent-dark">{formatCurrency(c.saldoRestante)}</td>
                    <td className="table-cell">{getStatusBadge(c.status)}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        {c.status !== 'PAGO' && (
                          <button onClick={() => handleOpenBaixaModal(c)} title="Realizar Baixa" className="p-1.5 text-revenue-light dark:text-revenue-dark hover:bg-revenue-light/10 rounded-lg transition-colors">
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button onClick={() => handleOpenModal(c)} title="Editar" className="p-1.5 text-accent-light dark:text-accent-dark hover:bg-accent-light/10 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} title="Excluir" className="p-1.5 text-expense-light dark:text-expense-dark hover:bg-expense-light/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary-light dark:text-text-secondary-dark italic text-sm">
                      Nenhum lançamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Lançamento (Novo/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card-light dark:bg-card-dark w-full max-w-2xl p-8 rounded-[14px] shadow-2xl border border-border-light dark:border-border-dark relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
            >
              <X size={18} />
            </button>
            <h2 className="text-[18px] font-bold mb-6 text-text-primary-light dark:text-text-primary-dark">
              {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="label-text">Tipo de Lançamento</label>
                  <select 
                    className="input-field" 
                    value={formData.tipo} 
                    onChange={e => setFormData({...formData, tipo: e.target.value as 'RECEITA' | 'DESPESA'})}
                  >
                    <option value="RECEITA">Receita (Entrada)</option>
                    <option value="DESPESA">Despesa (Saída)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label-text">Descrição</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={formData.descricao} 
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-text">Categoria</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.categoria} 
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-text">Pessoa (Cliente/Fornecedor)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.pessoa} 
                    onChange={e => setFormData({...formData, pessoa: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-text">Data de Vencimento</label>
                  <input 
                    type="date" 
                    required 
                    className="input-field" 
                    value={formData.dataVencimento} 
                    onChange={e => setFormData({...formData, dataVencimento: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-text">Valor Total</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="input-field" 
                    value={formData.valorTotal} 
                    onChange={e => setFormData({...formData, valorTotal: parseFloat(e.target.value)})}
                  />
                </div>
                {!editingId && (
                  <div className="space-y-1.5">
                    <label className="label-text">Quantidade de Parcelas</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="input-field" 
                      value={formData.quantidadeParcelas} 
                      onChange={e => setFormData({...formData, quantidadeParcelas: parseInt(e.target.value)})}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Observações</label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={formData.observacoes} 
                  onChange={e => setFormData({...formData, observacoes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Baixa (Pagamento) */}
      {isBaixaModalOpen && selectedConta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card-light dark:bg-card-dark w-full max-w-md p-8 rounded-[14px] shadow-2xl border border-border-light dark:border-border-dark relative">
            <button 
              onClick={() => setIsBaixaModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
            >
              <X size={18} />
            </button>
            <h2 className="text-[18px] font-bold mb-2 text-text-primary-light dark:text-text-primary-dark">Realizar Baixa</h2>
            <p className="text-[12px] text-text-secondary-light dark:text-text-secondary-dark mb-6">
              Registrar pagamento para: <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{selectedConta.descricao}</span>
            </p>
            
            <form onSubmit={handleBaixaSubmit} className="space-y-5">
              <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="label-text">Saldo Restante</span>
                  <span className="text-[14px] font-bold text-accent-light dark:text-accent-dark">{formatCurrency(selectedConta.saldoRestante)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-text">Valor do Pagamento</label>
                <input 
                  type="number" 
                  step="0.01" 
                  max={selectedConta.saldoRestante}
                  required 
                  className="input-field text-revenue-light dark:text-revenue-dark font-bold text-[16px]" 
                  value={baixaFormData.valor} 
                  onChange={e => setBaixaFormData({...baixaFormData, valor: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Data do Pagamento</label>
                <input 
                  type="date" 
                  required 
                  className="input-field" 
                  value={baixaFormData.dataPagamento} 
                  onChange={e => setBaixaFormData({...baixaFormData, dataPagamento: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Forma de Pagamento</label>
                <select 
                  className="input-field" 
                  value={baixaFormData.formaPagamento} 
                  onChange={e => setBaixaFormData({...baixaFormData, formaPagamento: e.target.value})}
                >
                  <option value="PIX">PIX</option>
                  <option value="BOLETO_BANCARIO">Boleto Bancário</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
                <button type="button" onClick={() => setIsBaixaModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary bg-revenue-light dark:bg-revenue-dark">Confirmar Baixa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contas;
