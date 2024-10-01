import * as yaml from 'js-yaml';
import * as core from '@actions/core';
import * as fs from 'fs';
import {checkMatchConfigs} from '../labeler_v5/src/labeler';
import {
  MatchConfig,
  getLabelConfigMapFromObject,
} from '../labeler_v5/src/api/get-label-configs';

jest.mock('@actions/core');

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options);
  });
});

const loadYaml = (filepath: string) => {
  const loadedFile = fs.readFileSync(filepath);
  const content = Buffer.from(loadedFile).toString();
  return yaml.load(content);
};


describe('when a single match config is provided', () => {
    const ymlContent = loadYaml('custom.yml');
    const parsedLabelsAndConfig = getLabelConfigMapFromObject(ymlContent);
    const resultArray: Array<string> = new Array<string>();
    const changedFiles = ['foo.txt', 'bar.txt', 'cma-assembly/java.java', 'pom.xml'];
    parsedLabelsAndConfig.forEach((value: MatchConfig[], key) => {
      const result = checkMatchConfigs(changedFiles, value, true);
      if (result) {
        resultArray.push(key);
      }
    });
    it('result', () => {
      expect(resultArray.length).toBe(1);
    });
});
