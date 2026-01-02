export interface VariableDef<T, K extends keyof T = keyof T> {
  name: K;
  description: string;
  example?: T[K];
}

export function exampleVariables<T>(variables: VariableDef<T>[]): T {
  const result = {} as T;
  for (const variable of variables) {
    result[variable.name] = variable.example as T[keyof T];
  }
  return result;
}
