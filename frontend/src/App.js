import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
// import Header from './components/Header';
import BSNavbar from './components/BSNavbar'
import Footer from './components/Footer';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import ProductPage from './components/ProductPage'
import NotFound from './components/NotFound';
import { AuthProvider } from './context/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (

    <AuthProvider>

    <Router>
      <div className="App">
        {/* <Header /> */}
        <BSNavbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>

    </AuthProvider>
  );
}

export default App;