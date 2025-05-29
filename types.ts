export interface CalculatorFormData {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  goal: "lose" | "maintain" | "gain";
}

export interface CalculatorResults {
  mifflin: number;
  harris: number;
  weightBased: { min: number; max: number };
  protein: number;
  fats: number;
  carbs: number;
}

export interface CalculatorState {
  formData: CalculatorFormData;
  results: CalculatorResults | null;
}

// Assistant Types
export interface AssistantAction {
  type: string;
  payload?: unknown;
}

export interface AssistantAppState {
  calculator_state: CalculatorState;
  [key: string]: unknown;
}

export interface AssistantSendData {
  action: {
    action_id: string;
    parameters: {
      value: string;
    };
  };
}

export type AssistantEvent =
  | { type: string; action?: AssistantAction; [key: string]: any }
  | AssistantEventCharacter
  | AssistantEventInsets;

export type AssistantEventStart = {
  type: "start";
  payload?: {
    projectName?: string;
    sessionId?: string;
    userChannel?: string;
    [key: string]: unknown;
  };
};

export interface AssistantEventCharacter {
  type: "character";
  character?: {
    id: string;
    [key: string]: any;
  };
}

export interface AssistantEventInsets {
  type: "insets";
  insets?: {
    [key: string]: any;
  };
}
