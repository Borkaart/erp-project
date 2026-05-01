import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contas from './pages/Contas';
import Clientes from './pages/Clientes';
import FluxoCaixa from './pages/FluxoCaixa';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
