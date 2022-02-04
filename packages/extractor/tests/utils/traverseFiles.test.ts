import fs from "node:fs/promises";
import path from "node:path";
import { traverseFiles } from "../../libs/utils/traverseFiles";

describe('traverseFiles', () => {
  it(`Traverse deeply nested test files`, async () => {
    const fsReaddirMock = jest.spyOn(fs, 'readdir');
    const fsStatMock = jest.spyOn(fs, 'stat');
    const mockFn = jest.fn();
    
    // Root level files and directories
    fsReaddirMock.mockResolvedValueOnce(["dir", "file1.ts", "file1.test.ts"] as any);
    // Files inside dir directory
    fsReaddirMock.mockResolvedValueOnce(["file2.ts", "file2.test.ts"] as any);

    fsStatMock.mockResolvedValueOnce({
      isDirectory:() => true,
    } as any);
    fsStatMock.mockResolvedValue({
      isDirectory:() => false
    } as any);

    await traverseFiles("root", mockFn);
    expect(mockFn.mock.calls).toEqual([[path.join("root", "dir", "file2.test.ts")], [path.join("root", "file1.test.ts")]])
  });
});
