# @exgen/extractor

<p align="center">
  <img src="https://img.shields.io/bundlephobia/minzip/@exgen/extractor?label=minzipped&style=flat&color=%23bb0a1e"/>
  <img src="https://img.shields.io/npm/dw/@exgen/extractor?style=flat&color=orange"/>
  <img src="https://img.shields.io/github/issues/devorein/nishan/@exgen/extractor?color=yellow"/>
  <img src="https://img.shields.io/npm/v/@exgen/extractor?color=%2303C04A"/>
  <img src="https://img.shields.io/codecov/c/github/devorein/exgen?flag=extractor&color=blue"/>
  <img src="https://img.shields.io/librariesio/release/npm/@exgen/extractor?color=%234B0082">
</p>

<p align="center">
  | <a href="https://github.com/Devorein/exgen/tree/main/packages/extractor">Github</a> |
  <a href="https://www.npmjs.com/package/@exgen/extractor">NPM</a> |
</p>

<p align="center"><b>Extract examples of how to consume your api from your unit tests</b></p>

Currently this library only works if you write your tests using jest and javascript/typescript, but I do have plans to support more testing framework. Complex tests with mocking, spying and using jest's api are still not supported.

## Conventions

In order to use this library effective you need to follow certain conventions while writing your unit tests.

1. Importing the function that you want to test in your test files as a named import.
2. Using the [`describe`](https://jestjs.io/docs/api#describename-fn) function provided by `jest` to write your tests
3. The first argument of describe should match the name of the imported function
4. Inside the `describe` callback invoke the `it` function to write individual tests
5. Each individual assertions would be written using `expect` function.

## Usage

1. import the default function `extractExamples` from the package
2. Invoke `extractExamples` by passing the path to your test directory

## How it works

1. `extractExamples` recursively loops through all the files inside your test directory
2. If it sees a file that ends with `.test.ts` or `.test.js` it tries to extract example from those files
3. Underneath the hood it uses `typescript` to parse the text content of those files and generate an ast
4. It loops through all the statements of the file
5. If it sees an import statement it stores all the named functions imported internally.
6. If it sees a `describe` function call it checks if the first argument (string) matches with one of the imported named function
7. If it does it checks all the statements of the 2nd argument (function/callback) otherwise it skips it completely
8. Inside the describe block, it again goes through all the statements and looks for the `it` function call
9. The first argument of `it` can be any appropriate message (ideally it should describe what this test is doing).
10. Just like `describe` block it goes through all the statements inside the 2nd argument of `it`
11. All the statements are stored (as they are necessary in order to setup assertions)
12. If we encounter an `expect` function call, it would be stored separately along with the expected value of the assertion

## Example

```js
// tests/index.test.ts
import { makeDouble } from './libs/makeDouble';

function getArgument() {
  return 1;
};

describe('makeDouble', () => {
  it("Convert 2 to double", () => {
    let argument = getArgument();
    argument+=1;
    const doubled = makeDouble(argument);
    expect(
      doubled
    ).toStrictEqual(4);
  });

  it("Convert 1 to double", () => {
    const doubled = makeDouble(1)
    expect(
      doubled
    ).toStrictEqual(1);
  });
});
```

```ts
// src/index.ts
import extractExamples from "@exgen/extractor";
import path from "path";

async function main() {
  const extractedExamples = await extractExamples(path.resolve(__dirname, "../tests"));
  console.log(extractedExamples);
}

main();
```

```ts

interface ExampleInfo {
  // Statements (except for expect that are inside the `it` function)
	statements: string[];
  // An array of assertion value and expected value
	logs: {
    // Assertion value
		arg: string;
    // expected value
		output: string;
	}[];
  // First argument of the `it` function, used as a message that describes the test 
	message: string;
};

// Each key of the object would be the name of the function
type FunctionExampleRecord = Record<string, ExampleInfo[]>;

const functionExampleRecord: FunctionExampleRecord = {
  makeDouble: [
    {
      logs: [{
        output: "4",
        arg: "doubled"
      }],
      message: "Convert 2 to double",
      statements: ["let argument = getArgument();", "argument += 1;", "const doubled = makeDouble(argument);"]
    }, 
    {
      logs: [{
        output: "1",
        arg: "doubled"
      }],
      message: "Convert 1 to double",
      statements: ["const doubled = makeDouble(1);"]
    }]
  })
}

```

The rest is up to you how to display or use this data. You can embed it inside your api documentation markdown file or any other files.

Please take a look at the [`@exgen/embedder`](https://www.npmjs.com/package/@exgen/embedder) package to see how you can embed this data in a markdown file generated by `typedoc` and `typedoc-plugin-markdown`

## Todo

1. Support for default imports
2. Support for nested describe block
3. Support for classes rather than only functions