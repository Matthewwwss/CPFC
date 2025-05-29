import React from "react";
import {
  createAssistant,
  createSmartappDebugger,
  AssistantAppState,
} from "@salutejs/client";
import { Container, DeviceThemeProvider } from "@salutejs/plasma-ui";
import { darkSber } from "@salutejs/plasma-tokens/themes";

import { CalculatorForm } from "./CalculatorForm";
import {
  AssistantAction,
  AssistantEvent,
  AssistantEventStart,
  AssistantSendData,
  CalculatorFormData,
  CalculatorResults,
} from "./types";
import logger from "./logger-init";

import "./App.css";

// Custom theme with green accent
const theme = {
  ...darkSber,
  accent: "#2ecc71",
  buttonAccent: "#2ecc71",
  buttonAccentHover: "#27ae60",
  buttonAccentActive: "#27ae60",
  buttonAccentFocus: "#2ecc71",
};

// Initialize assistant helper function
const initializeAssistant = (getState: () => AssistantAppState) => {
  try {
    if (import.meta.env.DEV) {
      return createSmartappDebugger({
        token: import.meta.env.VITE_SBER_TOKEN || "",
        initPhrase:
          import.meta.env.VITE_INIT_PHRASE || "Запусти калькулятор калорий",
        getState,
        nativePanel: {
          defaultText: "Рассчитай суточную норму калорий",
          screenshotMode: false,
          tabIndex: -1,
        },
      });
    } else {
      return createAssistant({ getState });
    }
  } catch (error) {
    logger.warn("Failed to initialize assistant:", error);
    return null;
  }
};

interface AppState {
  calculatorState: {
    formData: CalculatorFormData;
    results: CalculatorResults | null;
  };
  feedbackMessage: string | null;
}

export class App extends React.Component<Record<string, never>, AppState> {
  private assistant: ReturnType<typeof createAssistant> | null = null;

  constructor(props: Record<string, never>) {
    super(props);
    logger.log("Constructor");

    this.state = {
      calculatorState: {
        formData: {
          gender: "male",
          age: 25,
          height: 170,
          weight: 70,
          goal: "maintain",
        },
        results: null,
      },
      feedbackMessage: null,
    };

    // Try to initialize assistant, but don't fail if it doesn't work
    try {
      this.assistant = initializeAssistant(() => this.getStateForAssistant());

      if (this.assistant) {
        this.assistant.on("data", this.handleAssistantData);
        this.assistant.on("start", this.handleAssistantStart);
        this.assistant.on("command", (event) => {
          logger.log(`assistant.on(command)`, event);
        });
        this.assistant.on("error", (event) => {
          logger.log(`assistant.on(error)`, event);
        });
      }
    } catch (error) {
      logger.warn("Error setting up assistant:", error);
      this.assistant = null;
    }
  }

  // Methods for handling assistant interactions
  private handleAssistantData = (event: AssistantEvent) => {
    logger.log(`assistant.on(data)`, event);

    if (event.type === "character") {
      logger.log(`assistant.on(data): character: "${event.character?.id}"`);
    } else if (event.type === "insets") {
      logger.log(`assistant.on(data): insets`);
    } else if ("action" in event && event.action) {
      this.dispatchAssistantAction(event.action);
    }
  };

  private handleAssistantStart = ((event: AssistantEventStart) => {
    logger.log(`assistant.on(start)`, event);

    if (this.assistant) {
      try {
        const initialData = this.assistant.getInitialData();
        logger.log(`assistant initial data:`, initialData);
      } catch (error) {
        logger.warn("Could not get initial data:", error);
      }
    }
  }) as any;

  private sendActionValue(action_id: string, value: string): void {
    if (!this.assistant) {
      logger.log("Assistant not initialized, skipping sendActionValue");
      return;
    }

    try {
      const data: AssistantSendData = {
        action: {
          action_id,
          parameters: { value },
        },
      };

      this.assistant.sendData(data, (assistantData: any) => {
        const { type, payload } = assistantData || {};
        logger.log("sendData onData:", type, payload);
      });
    } catch (error) {
      logger.warn("Error sending action to assistant:", error);
    }
  }

  private getStateForAssistant(): AssistantAppState {
    logger.log("getStateForAssistant: this.state:", this.state);

    const state: AssistantAppState = {
      calculator_state: {
        formData: this.state.calculatorState.formData,
        results: this.state.calculatorState.results,
      },
    };

    logger.log("getStateForAssistant: state:", state);
    return state;
  }

  private async dispatchAssistantAction(
    action: AssistantAction,
  ): Promise<void> {
    logger.log("dispatchAssistantAction", action);

    try {
      switch (action.type) {
        case "set_gender":
          if (
            action.payload &&
            (action.payload === "male" || action.payload === "female")
          ) {
            this.setState((prevState) => ({
              calculatorState: {
                ...prevState.calculatorState,
                formData: {
                  ...prevState.calculatorState.formData,
                  gender: action.payload as "male" | "female",
                },
              },
            }));

            const genderText =
              action.payload === "male" ? "мужской" : "женский";
            this.sendActionValue("feedback", `Пол установлен: ${genderText}`);
            this.setFeedbackMessage(`Пол установлен: ${genderText}`);
          }
          break;

        case "set_age":
          if (action.payload && !isNaN(Number(action.payload))) {
            const newAge = Number(action.payload);
            if (newAge > 0 && newAge < 120) {
              this.setState((prevState) => ({
                calculatorState: {
                  ...prevState.calculatorState,
                  formData: {
                    ...prevState.calculatorState.formData,
                    age: newAge,
                  },
                },
              }));

              this.sendActionValue(
                "feedback",
                `Возраст установлен: ${newAge} лет`,
              );
              this.setFeedbackMessage(`Возраст установлен: ${newAge} лет`);
            }
          }
          break;

        case "set_height":
          if (action.payload && !isNaN(Number(action.payload))) {
            const newHeight = Number(action.payload);
            if (newHeight > 50 && newHeight < 250) {
              this.setState((prevState) => ({
                calculatorState: {
                  ...prevState.calculatorState,
                  formData: {
                    ...prevState.calculatorState.formData,
                    height: newHeight,
                  },
                },
              }));

              this.sendActionValue(
                "feedback",
                `Рост установлен: ${newHeight} см`,
              );
              this.setFeedbackMessage(`Рост установлен: ${newHeight} см`);
            }
          }
          break;

        case "set_weight":
          if (action.payload && !isNaN(Number(action.payload))) {
            const newWeight = Number(action.payload);
            if (newWeight > 20 && newWeight < 300) {
              this.setState((prevState) => ({
                calculatorState: {
                  ...prevState.calculatorState,
                  formData: {
                    ...prevState.calculatorState.formData,
                    weight: newWeight,
                  },
                },
              }));

              this.sendActionValue(
                "feedback",
                `Вес установлен: ${newWeight} кг`,
              );
              this.setFeedbackMessage(`Вес установлен: ${newWeight} кг`);
            }
          }
          break;

        case "set_goal":
          if (action.payload) {
            if (
              action.payload === "lose" ||
              action.payload === "maintain" ||
              action.payload === "gain"
            ) {
              this.setState((prevState) => ({
                calculatorState: {
                  ...prevState.calculatorState,
                  formData: {
                    ...prevState.calculatorState.formData,
                    goal: action.payload as "lose" | "maintain" | "gain",
                  },
                },
              }));

              const goalText =
                action.payload === "lose"
                  ? "снижение веса"
                  : action.payload === "maintain"
                    ? "поддержание веса"
                    : "набор массы";

              this.sendActionValue("feedback", `Цель установлена: ${goalText}`);
              this.setFeedbackMessage(`Цель установлена: ${goalText}`);
            }
          }
          break;

        case "calculate":
          await this.handleCalculation();
          break;

        default:
          logger.warn("Unknown assistant action type:", action.type);
      }
    } catch (error) {
      logger.error("Error dispatching assistant action:", error);
    }
  }

  private setFeedbackMessage(message: string): void {
    this.setState({ feedbackMessage: message });

    // Clear feedback after delay
    setTimeout(() => {
      this.setState({ feedbackMessage: null });
    }, 3000);
  }

  // Calculator methods
  private handleFormChange = (formData: CalculatorFormData): void => {
    this.setState((prevState) => ({
      calculatorState: {
        ...prevState.calculatorState,
        formData,
      },
    }));
  };

  private handleCalculation = async (): Promise<void> => {
    try {
      const { gender, age, height, weight, goal } =
        this.state.calculatorState.formData;

      const mifflin =
        gender === "male"
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;

      const harris =
        gender === "male"
          ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
          : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

      const weightBased = {
        min:
          goal === "lose"
            ? 22 * weight
            : goal === "maintain"
              ? 26 * weight
              : 30 * weight,
        max:
          goal === "lose"
            ? 25 * weight
            : goal === "maintain"
              ? 30 * weight
              : 35 * weight,
      };

      const protein = goal === "gain" ? 2.5 * weight : 1.8 * weight;
      const fats = 1 * weight;
      const carbs = (mifflin - (protein * 4 + fats * 9)) / 4;

      const newResults = { mifflin, harris, weightBased, protein, fats, carbs };

      this.setState((prevState) => ({
        calculatorState: {
          ...prevState.calculatorState,
          results: newResults,
        },
      }));

      // Send results to assistant
      if (this.assistant) {
        const summaryText =
          `По формуле Миффлина-Сан Жеора: ${Math.round(mifflin)} ккал/день. ` +
          `Белков: ${Math.round(protein)}г, Жиров: ${Math.round(fats)}г, ` +
          `Углеводов: ${Math.round(carbs)}г.`;

        this.sendActionValue("results", summaryText);
        this.setFeedbackMessage("Расчет выполнен!");
      }
    } catch (error) {
      logger.error("Error calculating results:", error);
    }
  };

  render() {
    const { formData, results } = this.state.calculatorState;
    const { feedbackMessage } = this.state;

    return (
      <DeviceThemeProvider theme={theme}>
        <Container>
          <div className="app-container">
            <CalculatorForm
              formData={formData}
              results={results}
              onFormChange={this.handleFormChange}
              onCalculate={this.handleCalculation}
              feedbackMessage={feedbackMessage}
            />
          </div>
        </Container>
      </DeviceThemeProvider>
    );
  }
}
