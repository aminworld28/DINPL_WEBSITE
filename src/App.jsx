import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Home from './Pages/Home';
import Careers from './Pages/Careers';
import Team from './Pages/Team';
import Wall from './Pages/Wall';
import Collaborate from './Pages/Collaborate';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Admin from './Pages/Admin';
import { ContentProvider } from './Context/ContentContext';
import { AuthProvider } from './Context/AuthContext';

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
