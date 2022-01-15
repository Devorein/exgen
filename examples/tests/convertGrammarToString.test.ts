/// <reference types="@types/jest"/>
import { convertGrammarToString } from '../libs/convertGrammarToString';

describe('convertGrammarToString', () => {
	it(`convertGrammarToString`, () => {
    const expected = [
			'S -> Adj Noun Verb | Adj Verb',
			'Noun -> Sam | Alice | ϵ',
			'Adj -> quickly',
			'Verb -> talked',
		]
		expect(
			convertGrammarToString({
				S: ['Adj Noun Verb', 'Adj Verb'],
				Noun: ['Sam', 'Alice', ''],
				Adj: ['quickly'],
				Verb: ['talked'],
			})
		).toStrictEqual(expected);
	});

  it(`Should convert grammar to string`, () => {
		expect(
			convertGrammarToString({
				S: ['Adj Noun Verb', 'Adj Verb'],
				Noun: ['Sam', 'Alice', ''],
				Adj: ['quickly'],
				Verb: ['talked'],
			})
		).toStrictEqual([
			`S -> Adj Noun Verb | Adj Verb`,
			'Noun -> Sam | Alice | ϵ',
			'Adj -> quickly',
			'Verb -> talked',
		]);
	});
});

it(`Should convert grammar to string`, () => {
  expect(
    convertGrammarToString({
      S: ['Adj Noun Verb', 'Adj Verb'],
      Noun: ['Sam', 'Alice', ''],
      Adj: ['quickly'],
      Verb: ['talked'],
    })
  ).toStrictEqual([
    `S -> Adj Noun Verb | Adj Verb`,
    'Noun -> Sam | Alice | ϵ',
    'Adj -> quickly',
    'Verb -> talked',
  ]);
});