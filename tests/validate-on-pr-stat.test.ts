import { run } from '../labeler_v5/src/labeler';
import * as github from '@actions/github';
import '@actions/core';
import fs from 'fs';

jest.mock('@actions/core');
jest.mock('@actions/github');

const gh = github.getOctokit('_');
const setLabelsMock = jest.spyOn(gh.rest.issues, 'setLabels');
const paginateMock = jest.spyOn(gh, 'paginate');
const reposMock = jest.spyOn(gh.rest.repos, 'getContent');

afterEach(() => jest.restoreAllMocks());

function mockGitHubResponseChangedFiles(files: string[]): void {
  const returnValue = files.map(f => ({filename: f}));
  paginateMock.mockReturnValue(<any>returnValue);
}

interface PRStatistic {
  files: string[];
  expected_labels: string[];
}

interface PRStatistics {
  [pr_id: string]: PRStatistic;
}

const jsonStat: PRStatistics = JSON.parse(fs.readFileSync('pr_statistics.json', 'utf-8'));
const labelerConfig = fs.readFileSync('labeler-rules.yml');

const testCases = Object.entries(jsonStat).map(([pr_id, data]) => [
  pr_id,
  data['files'],
  data['expected_labels']
]);

describe('Parametrized test cases for all entries in pr_statistics.json', () => {
  test.each(testCases)(
    "Test case for PR #%s",
    async (prNumber,changedFiles,expectedLabels) => {

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
