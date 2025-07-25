import styled from 'styled-components';

const ButtonBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const LeftButtonGroup = styled.div`
  display: flex;

  @media (min-width: 600px) {
      gap: 15px;
  }
`;

const RightButtonGroup = styled.div`
  display: flex;

  @media (min-width: 600px) {
      gap: 15px;
  }
`;

const StyledButton = styled.button`
  padding: 2px 4px;
  font-size: 0.8rem;
  color: #6950a1;
  background-color: white;
  border: 1px solid #6950a1;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #6950a1;
    color: white;
    transform: scale(1.1);
  }

  @media (min-width: 600px) {
    padding: 6px 8px;
    font-size: 1rem;
  }
`;

const SlideChangeButton = ({ onClick, children }) => {
  return <StyledButton onClick={onClick}>{children}</StyledButton>;
};

const SlideChangeButtonBar = ({
  onBackgroundChange,
  onToggleAnimations,
  animationsEnabled,
  onRearrangeSlides,
  onRevisionHistory,
}) => {
  return (
    <ButtonBarContainer>
      <LeftButtonGroup>
        <SlideChangeButton onClick={onBackgroundChange}>Change Background</SlideChangeButton>
        <SlideChangeButton onClick={onToggleAnimations}>
          {animationsEnabled ? 'Disable Animation' : 'Add Animation'}
        </SlideChangeButton>
        <SlideChangeButton onClick={onRearrangeSlides}>Rearrange Slides</SlideChangeButton>
      </LeftButtonGroup>
      <RightButtonGroup>
        <SlideChangeButton onClick={onRevisionHistory}>Revision History</SlideChangeButton>
      </RightButtonGroup>
    </ButtonBarContainer>
  );
};

export { SlideChangeButton, SlideChangeButtonBar };