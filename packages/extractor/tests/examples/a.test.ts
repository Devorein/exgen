/// <reference types="@types/jest"/>
import { makeDouble } from './libs/makeDouble';
import makeTriple from "./libs/makeTriple";

// Needed to test for default import
makeTriple(2);

function getArgument() {
  return 1;
};

describe('makeDouble', () => {
	it(`Convert 2 to double`, () => {
		let argument = getArgument();
    argument+=1;
    const doubled = makeDouble(argument);
    expect(
			doubled
		).toStrictEqual(4);
	});

  it(`Convert 1 to double`, () => {
    const doubled = makeDouble(1)
    expect(
			doubled
		).toStrictEqual(1);
	});
});