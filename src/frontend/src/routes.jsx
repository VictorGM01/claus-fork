import Home from './pages/home';
import Notification from './pages/notification';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/historico' element={<h1>Histórico</h1>} />
        <Route path='/notificacoes' element={<Notification />} />
      </Routes>
    </Router>
  );
}
