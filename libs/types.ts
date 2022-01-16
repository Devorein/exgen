export interface ExampleInfo {
  statements: string[],
  logs: {
    arg: string,
    output: string
  }[]
  message: string
}

export type FunctionExampleRecord = Record<string, ExampleInfo[]>