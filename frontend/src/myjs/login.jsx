import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #6950a1;
  color: white;
`;

const MainTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;

  @media (min-width: 600px) {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }
`;

const LoginBox = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FormTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 10px;

  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Input = styled.input`
  padding: 10px;
  margin: 8px 0;
  width: 90%;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  outline: none;
  transition: box-shadow 0.3s ease;

  &:focus {
    box-shadow: 0 0 5px #afb4db;
  }
`;

const ErrorText = styled.p`
  color: #ed1941;
  font-size: 1.1rem;
  margin: 5px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #6950a1;
  background-color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #9999cc;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    background-color: #afb4db;
    transform: scale(0.98);
  }
`;

function Login({ onLogin, isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post('https://z5503600-presto-backend.vercel.app/admin/auth/login', {
        email,
        password,
      });
      const token = response.data.token;
      onLogin(token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to login');
      }
    }
  }
  
  return (
    <PageContainer>
      <MainTitle>Welcome to Presto!</MainTitle>
      <LoginBox>
        <FormTitle>Log in</FormTitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorText>{error}</ErrorText>}
          <ButtonContainer>
            <Button type="button" onClick={() => navigate('/')}>Back</Button>
            <Button type="submit">Submit</Button>
          </ButtonContainer>
        </form>
      </LoginBox>
    </PageContainer>
  );
}

export default Login;