import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { AuthContext }  from '../context/AuthContext'
import { Alert, Container, Form, Button } from 'react-bootstrap';


const isDev = process.env.REACT_APP_IS_DEV === 'true';
const URL = isDev ? 'http://localhost:3030/auth/login' : '/auth/login';

const LoginForm = () => {

const { login, saveId } = useContext(AuthContext);

  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState(''); // Stato per messaggi di successo o errore
  const [variant, setVariant] = useState(''); // Stato per Alert

  const handleChange = (e) => {
    const {name, value} = e.target;
      setFormData({
        ...FormData,
        [name]: value,
      });
  };


   // Gestione del submit del form
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', FormData);
        try {
            const response = await axios.post(`${URL}`, FormData, {
              headers : { 'Content-Type' : 'application/json' },
            });
            setMessage('Signup successful!');
            //destrucuring da un oggetto
            const { token, id } = response.data;
            //salvo id tramite context
            saveId(id);
            //salvo il token tramite context
            login(token);
            setVariant('success');
            //piccolo delay per navigare a /products 
            // setTimeout(() => {
            //   navigate('/products');
            // }, 500);
            navigate('/products', { replace: true });

        } catch (error) {
            setMessage(error.response?.data?.message || 'Signup failed!'); // Mostra un messaggio di errore
            setVariant('danger')
            console.error(error.response?.data);
    }
  };

  return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Form className="p-4 border rounded shadow" onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control 
                  type="email"
                  name="email"
                  value={FormData.email}
                  onChange={handleChange}
                  placeholder="Enter email" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password"
                  name="password"
                  value={FormData.password}
                  onChange={handleChange}
                  placeholder="Password" />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Login
              </Button>
              {message && <Alert variant={variant} className='mt-3'>{message}</Alert>}
            </Form>
      </Container>
  );
};

export default LoginForm;