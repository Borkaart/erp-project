import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Clientes</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-2">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar clientes..." 
          className="bg-transparent border-none focus:outline-none w-full text-slate-800 dark:text-white"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F97316]"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b dark:border-slate-700/50">
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Nome</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Documento</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Email</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Telefone</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{c.nome}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c.documento}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c.telefone}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(c)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 bg-white dark:bg-slate-900 border-white/20 border-2">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Nome</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Documento (CPF/CNPJ)</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.documento} 
                  onChange={e => setFormData({...formData, documento: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Email</label>
                <input 
                  type="email" 
                  required 
                  className="input-field" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.telefone} 
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
