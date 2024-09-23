import Home from './pages/home';
import Email from './pages/emails';
import History from './pages/history';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/historico' element={<History />} />
        <Route path='/emails' element={<Email />} />
      </Routes>
    </Router>
  );
}
