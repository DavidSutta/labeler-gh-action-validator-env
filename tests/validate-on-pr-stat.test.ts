import { run } from '../labeler_v5/src/labeler';
import * as github from '@actions/github';
import '@actions/core';
import fs from 'fs';

jest.mock('@actions/core');
jest.mock('@actions/github');

const gh = github.getOctokit('_');
const setLabelsMock = jest.spyOn(gh.rest.issues, 'setLabels');
// const getPullMock = jest.spyOn(gh.rest.pulls, 'get');
const paginateMock = jest.spyOn(gh, 'paginate');
// const setOutputSpy = jest.spyOn(core, 'setOutput');
const reposMock = jest.spyOn(gh.rest.repos, 'getContent');

// const configureInput = (
//   mockInput: Partial<{
//   'repo-token': string;
//   'configuration-path': string;
//   'sync-labels': boolean;
//   'pr-number': string[];
// }>) => {
//   jest.spyOn(core, 'getInput').mockImplementation((name: string) => mockInput[name] as string);
//   jest.spyOn(core, 'getMultilineInput').mockImplementation((name: string) => mockInput[name] as string[]);
//   jest.spyOn(core, 'getBooleanInput').mockImplementation((name: string) => mockInput[name] as boolean);
// };

afterAll(() => jest.restoreAllMocks());

interface PRStatistic {
  files: string[];
  expected_labels: string[];
}

interface PRStatistics {
  [pr_id: string]: PRStatistic;
}

const jsonStat: PRStatistics = JSON.parse(fs.readFileSync('pr_statistics.json', 'utf-8'));
const labelerConfig = fs.readFileSync('custom.yml');

const testCases = Object.entries(jsonStat).map(([pr_id, data]) => [
  pr_id,
  data['files'],
  data['expected_labels']
]);

describe('test_parametrized', () => {
  test.each(testCases)(
    "Test case for PR #%s",
    async (prNumber,changedFiles,expectedLabels) => {

      // configureInput({});

      reposMock.mockResolvedValue(<any>{
        data: { content: labelerConfig, encoding: 'utf8' }
      });

      console.log("Setting changed files for the mock object.");
      console.debug(changedFiles);
      mockGitHubResponseChangedFiles(changedFiles as string[]);

      console.log("Executing labeler action...");
      await run();

      if (expectedLabels.length === 0) {
        expect(setLabelsMock).not.toHaveBeenCalled();
      }
      else {
        expect(setLabelsMock).toHaveBeenCalledWith({
          owner: 'monalisa',
          repo: 'helloworld',
          issue_number: 123,
          labels: expectedLabels
        });
      }
    }
  );
});

function mockGitHubResponseChangedFiles(files: string[]): void {
  const returnValue = files.map(f => ({filename: f}));
  paginateMock.mockReturnValue(<any>returnValue);
}
