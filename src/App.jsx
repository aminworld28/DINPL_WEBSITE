import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Careers from './pages/Careers';
import Team from './pages/Team';
import Wall from './pages/Wall';
import Collaborate from './pages/Collaborate';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <Routes>
            {/* Admin has its own shell (sidebar/header), so it lives outside <Layout> */}
            <Route path="/admin" element={<Admin />} />

            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/wall" element={<Wall />} />
                    <Route path="/collaborate" element={<Collaborate />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;
