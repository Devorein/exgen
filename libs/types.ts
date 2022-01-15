export type FunctionExampleRecord = Record<string, {
  statements: string[],
  logs: {
    arg: string,
    output: string
  }[]
}>