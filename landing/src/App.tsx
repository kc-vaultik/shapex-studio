import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Docs from './pages/Docs';
import SignUp from './pages/SignUp';
import Studio from './pages/Studio';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
