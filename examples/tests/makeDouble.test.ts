/// <reference types="@types/jest"/>
import { makeDouble } from '../libs/makeDouble';

describe('makeDouble', () => {
	it(`makeDouble`, () => {
		const doubled = makeDouble(1);
    expect(
			doubled
		).toStrictEqual(2);
	});
});