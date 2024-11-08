import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #6950a1;
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  animation: ${fadeIn} 1s ease-in-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
`;

const StyledButton = styled(Link)`
  padding: 12px 24px;
  font-size: 1.1rem;
  color: #6950a1;
  background-color: white;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.1s ease;

  &:hover {
    background-color: #ddd;
  }
`;

function LandingPage() {
  return (
    <LandingPageContainer>
      <Title>Welcome to Presto!</Title>
      <ButtonContainer>
        <StyledButton to="/login">Log in</StyledButton>
        <StyledButton to="/register">Register</StyledButton>
      </ButtonContainer>
    </LandingPageContainer>
  );
}

export default LandingPage;