import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Contact from './pages/Contact';
import Newsletter from './pages/Newsletter';
import Issues from './pages/Issues';
import Ludvig from './pages/Ludvig';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Licenses from './pages/Licenses';
import Changelog from './pages/Changelog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Contact />} />
          <Route path="contact" element={<Contact />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="issues" element={<Issues />} />
          <Route path="ludvig" element={<Ludvig />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="changelog" element={<Changelog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
