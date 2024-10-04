# GitHub Labeler Action Validation Tool for PR Histories

This repository provides tools for generating statistics on modified files in a GitHub repository's pull requests and validating if the [GitHub labeler action](https://github.com/actions/labeler?tab=readme-ov-file#pull-request-labeler) would correctly assign the expected labels based on the user's custom ruleset (labeler configuration).
Currently support release [v5.0.0](https://github.com/actions/labeler/releases/tag/v5.0.0) of the GitHub action

## Prerequisites

- [VSCode](https://code.visualstudio.com/) (recommended)
- Devcontainer with a custom image is already configured

## Getting Started

### 1. Clone this repository
```bash
git clone git@github.com:DavidSutta/labeler-gh-action-validator-env.git
cd labeler-gh-action-validator-env
```
If you open this project in VSCode, install the [Devcontainers plugin](https://code.visualstudio.com/docs/devcontainers/containers), then open the project in a container

### 2. Initialize Submodule
The `labeler_v5` directory is a git submodule. Run the following command to pull its content:
```bash
cd labeler_v5
git pull
```

### 3. Generate PR Statistics

Run the `github_pr_history.py` script to generate a statistics file for pull request history.

#### Script Parameters:
- `--gh-token` (Required): GitHub personal access token.
- `--repo-owner` (Required): Repository owner's GitHub username.
- `--repo-name` (Required): Name of the repository.
- `--gh-api-baseurl` (Required): GitHub API base URL (e.g., https://api.github.com).
- `--pr-history-per-page`: Number of PRs per page (default: 100, max: 100).
- `--pr-history-number-of-pages`: Number of pages to fetch (default: 1).

Example:
```bash
python github_pr_history.py --gh-token <your-token> \
    --repo-owner <owner> --repo-name <repo> \
    --gh-api-baseurl https://api.github.com \
    --pr-history-per-page 100 --pr-history-number-of-pages 2
```

### 4. Manually Edit PR Statistics
After running the script, a file named `pr_statistics.json` will be generated. You will need to manually fill in the `expected_labels` for each pull request in the file.

### 5. Add Labeler Configuration

Create a labeler configuration file in the root of the project and name it `labeler-rules.yml`. Or copy the one you have in your live CI system.

#### Example content:
```yaml
label-to-be-applied:
  - any:
      - changed-files:
          - all-globs-to-any-file:
              - '!**/*.{txt,md,html,scss,svg}'
              - '{server}/**'
          - any-glob-to-any-file:
              - 'pom.xml'
```

### 6. Run Tests
Once the `expected_labels` have been added to the `pr_statistics.json` file, you can run the Jest tests to validate whether the labeler GitHub action would assign the correct labels.

To run the tests:
```bash
jest tests/validate-on-pr-stat.test.ts
```
This will also produce a HTML report for the tests named `test-report.html`.
