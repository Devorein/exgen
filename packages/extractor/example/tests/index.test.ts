import { makeDouble } from '../src/libs/makeDouble';

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