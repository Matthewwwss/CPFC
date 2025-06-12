import { useState, useEffect } from "react";
import {
  Card,
  Button,
  TextField,
  Row,
  Col,
  Radiobox,
  Headline1,
  Headline3,
  Body1,
} from "@salutejs/plasma-ui";
import { CalculatorFormData, CalculatorResults } from "./types";
import styled from "styled-components";

interface CalculatorFormProps {
  formData: CalculatorFormData;
  results: CalculatorResults | null;
  onFormChange: (formData: CalculatorFormData) => void;
  onCalculate: () => void;
  feedbackMessage: string | null;
}

const FormCard = styled(Card)`
  width: 100%;
  padding: 24px;
  margin-bottom: 24px;
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  max-width: 1024px;
`;

const ResultsCard = styled(Card)`
  width: 100%;
  padding: 24px;
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  max-width: 1024px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const RadioWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;

  &:focus-within {
    outline: 2px solid #2ecc71;
    outline-offset: 2px;
  }

  &:hover {
    background-color: rgba(46, 204, 113, 0.1);
  }
`;

const RadioContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 8px;

  & > div,
  & > label {
    display: flex !important;
    align-items: center !important;
    height: 24px !important;
  }
`;

const GoalRadioContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;

  & > div,
  & > label {
    display: flex !important;
    align-items: center !important;
    height: 24px !important;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FormTitle = styled(Headline1)`
  text-align: center;
  margin-bottom: 32px;
  color: #2ecc71;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 32px;
  height: 52px;
  background-color: #2ecc71;
  transition: all 0.2s ease;

  &:hover {
    background-color: #27ae60;
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.4);
  }

  &:focus {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.4);
  }
`;

const ResultsTitle = styled(Headline3)`
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(46, 204, 113, 0.3);
  padding-bottom: 12px;
  color: #2ecc71;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const FeedbackMessage = styled.div`
  background-color: rgba(46, 204, 113, 0.2);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #2ecc71;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StyledLabel = styled(Body1)`
  margin-bottom: 10px;
  color: #ffffff;
  font-weight: 500;
`;

const CustomTextField = styled(TextField)`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;

  & input {
    color: white;
  }

  &:focus-within {
    border-color: #2ecc71;
  }
`;

export const CalculatorForm = ({
  formData,
  results,
  onFormChange,
  onCalculate,
  feedbackMessage,
}: CalculatorFormProps) => {
  const [localFormData, setLocalFormData] = useState<CalculatorFormData>(formData);

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const focusableElements = Array.from(
      document.querySelectorAll('input, button')
    );
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        (focusableElements[nextIndex] as HTMLElement).focus();
        break;
      
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        (focusableElements[prevIndex] as HTMLElement).focus();
        break;

      case 'Enter':
        if (e.target instanceof HTMLInputElement && e.target.type === 'radio') {
          e.preventDefault();
          e.target.click();
        }
        break;
    }
  };

  const handleChange = <K extends keyof CalculatorFormData>(
    key: K,
    value: CalculatorFormData[K],
  ) => {
    const newFormData = { ...localFormData, [key]: value };
    setLocalFormData(newFormData);
    onFormChange(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "age" | "height" | "weight",
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      handleChange(field, value === "" ? 0 : Number(value));
    }
  };

  return (
    <>
      <FormTitle>Калькулятор нормы калорий</FormTitle>

      {feedbackMessage && <FeedbackMessage>{feedbackMessage}</FeedbackMessage>}

      <FormCard>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Row>
            <Col size={12}>
              <FormGroup>
                <StyledLabel>Ваш пол:</StyledLabel>
                <RadioContainer>
                  <RadioWrapper>
                    <Radiobox
                      label="Мужской"
                      checked={localFormData.gender === "male"}
                      onChange={() => handleChange("gender", "male")}
                      tabIndex={0}
                    />
                  </RadioWrapper>
                  <RadioWrapper>
                    <Radiobox
                      label="Женский"
                      checked={localFormData.gender === "female"}
                      onChange={() => handleChange("gender", "female")}
                      tabIndex={1}
                    />
                  </RadioWrapper>
                </RadioContainer>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col size={12} sizeM={4}>
              <FormGroup>
                <StyledLabel>Ваш возраст:</StyledLabel>
                <CustomTextField
                  type="text"
                  value={localFormData.age === 0 ? "" : localFormData.age}
                  onChange={(e) => handleInputChange(e, "age")}
                  placeholder="Лет"
                  tabIndex={2}
                />
              </FormGroup>
            </Col>
            <Col size={12} sizeM={4}>
              <FormGroup>
                <StyledLabel>Ваш рост, см:</StyledLabel>
                <CustomTextField
                  type="text"
                  value={localFormData.height === 0 ? "" : localFormData.height}
                  onChange={(e) => handleInputChange(e, "height")}
                  placeholder="См"
                  tabIndex={3}
                />
              </FormGroup>
            </Col>
            <Col size={12} sizeM={4}>
              <FormGroup>
                <StyledLabel>Ваш вес, кг:</StyledLabel>
                <CustomTextField
                  type="text"
                  value={localFormData.weight === 0 ? "" : localFormData.weight}
                  onChange={(e) => handleInputChange(e, "weight")}
                  placeholder="Кг"
                  tabIndex={4}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col size={12}>
              <FormGroup>
                <StyledLabel>Ваша цель:</StyledLabel>
                <GoalRadioContainer>
                  <RadioWrapper>
                    <Radiobox
                      label="Сбросить вес"
                      checked={localFormData.goal === "lose"}
                      onChange={() => handleChange("goal", "lose")}
                      tabIndex={5}
                    />
                  </RadioWrapper>
                  <RadioWrapper>
                    <Radiobox
                      label="Поддерживать вес"
                      checked={localFormData.goal === "maintain"}
                      onChange={() => handleChange("goal", "maintain")}
                      tabIndex={6}
                    />
                  </RadioWrapper>
                  <RadioWrapper>
                    <Radiobox
                      label="Набрать массу"
                      checked={localFormData.goal === "gain"}
                      onChange={() => handleChange("goal", "gain")}
                      tabIndex={7}
                    />
                  </RadioWrapper>
                </GoalRadioContainer>
              </FormGroup>
            </Col>
          </Row>

          <SubmitButton 
            view="primary" 
            type="submit"
            role="button"
            tabIndex={8}
          >
            Рассчитать
          </SubmitButton>
        </form>
      </FormCard>

      {results && (
        <ResultsCard>
          <ResultsTitle>Ваши результаты</ResultsTitle>

          <Row>
            <Col size={12} sizeM={6}>
              <div style={{ marginBottom: "24px" }}>
                <ResultsTitle as="h4" style={{ fontSize: "20px" }}>
                  Суточная норма калорий
                </ResultsTitle>
                <ResultRow>
                  <Body1>По формуле Миффлина-Сан Жеора:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.mifflin)} ккал
                  </Body1>
                </ResultRow>
                <ResultRow>
                  <Body1>По формуле Харриса-Бенедикта:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.harris)} ккал
                  </Body1>
                </ResultRow>
                <ResultRow>
                  <Body1>Рекомендуемый диапазон:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.weightBased.min)} -{" "}
                    {Math.round(results.weightBased.max)} ккал
                  </Body1>
                </ResultRow>
              </div>
            </Col>
            <Col size={12} sizeM={6}>
              <div>
                <ResultsTitle as="h4" style={{ fontSize: "20px" }}>
                  Рекомендуемые макронутриенты
                </ResultsTitle>
                <ResultRow>
                  <Body1>Белки:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.protein)} г
                  </Body1>
                </ResultRow>
                <ResultRow>
                  <Body1>Жиры:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.fats)} г
                  </Body1>
                </ResultRow>
                <ResultRow>
                  <Body1>Углеводы:</Body1>
                  <Body1 style={{ fontWeight: "bold", color: "#2ecc71" }}>
                    {Math.round(results.carbs)} г
                  </Body1>
                </ResultRow>
              </div>
            </Col>
          </Row>
        </ResultsCard>
      )}
    </>
  );
};
