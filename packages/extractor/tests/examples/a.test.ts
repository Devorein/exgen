/// <reference types="@types/jest"/>
import { makeDouble } from './libs/makeDouble';

describe('makeDouble', () => {
	it(`Convert to double 1`, () => {
		const doubled = makeDouble(1);
    expect(
			doubled
		).toStrictEqual(2);
	});
});