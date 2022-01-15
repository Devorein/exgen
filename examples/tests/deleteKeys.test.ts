/// <reference types="@types/jest"/>
import { deleteKeys } from '../libs/deleteKeys';

describe('', () => {
	it(`deleteKeys`, () => {
    const object = {a: 1, b: 2};
		deleteKeys(object, ["b"]);

    expect(
			object
		).toStrictEqual({
      a: 1
    });
	});
});