import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { api } from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', documento: '' });

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({ 
        nome: cliente.nome, 
        email: cliente.email, 
        telefone: cliente.telefone || '', 
        documento: cliente.documento || '' 
      });
    } else {
      setEditingCliente(null);
      setFormData({ nome: '', email: '', telefone: '', documento: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, formData);
      } else {
        await api.post('/clientes', formData);
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente', error);
      alert('Erro ao salvar cliente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        fetchClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente', error);
      }
    }
  };

  const filtered = clientes.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="section-title mb-0">Gestão de Clientes</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark" />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
                  <th className="table-header">Nome</th>
                  <th className="table-header">Documento</th>
                  <th className="table-header">E-mail</th>
                  <th className="table-header">Telefone</th>
                  <th className="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="table-cell font-medium">{c.nome}</td>
                    <td className="table-cell text-text-secondary-light dark:text-text-secondary-dark">{c.documento}</td>
                    <td className="table-cell">{c.email}</td>
                    <td className="table-cell">{c.telefone}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
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
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary-light dark:text-text-secondary-dark italic text-sm">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card-light dark:bg-card-dark w-full max-w-md p-8 rounded-[14px] shadow-2xl border border-border-light dark:border-border-dark relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
            >
              <X size={18} />
            </button>
            <h2 className="text-[18px] font-bold mb-6 text-text-primary-light dark:text-text-primary-dark">
              {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="label-text">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Documento (CPF/CNPJ)</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.documento} 
                  onChange={e => setFormData({...formData, documento: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">E-mail</label>
                <input 
                  type="email" 
                  required 
                  className="input-field" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.telefone} 
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
