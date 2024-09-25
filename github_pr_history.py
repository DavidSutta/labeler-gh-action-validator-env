from dataclasses import dataclass
import requests
import json
import argparse
requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)

@dataclass
class GitHubConnection:
    gh_token: str
    repo_owner: str
    repo_name: str
    base_api_url:str

    def __post_init__(self):
        self.HEADERS: dict = {
            "Authorization": f"token {self.gh_token}",
            "Accept": "application/json"
        }

@dataclass
class PaginationData:
    per_page: int
    number_of_pages: int

def get_pr_ids(conn_object: GitHubConnection, pagination_data: PaginationData) -> list[str]:
    pr_ids: list[str] = list()

    for i in range(1, pagination_data.number_of_pages):
        url = f"{conn_object.base_api_url}/{conn_object.repo_owner}/{conn_object.repo_name}/pulls"
        response = requests.get(url, headers=conn_object.HEADERS, verify=False, 
                                params={"state": "all",
                                        "per_page": pagination_data.per_page,
                                        "page": i
                                        })
        if response.ok:
            pr_ids.extend([pr["number"] for pr in response.json()])
        else:
            print(f"Failed to fetch PRs: {response.status_code}")

    return pr_ids

def get_modified_files_in_pr(conn_obj: GitHubConnection, pr_number: str) -> list[str]:
    url = f"{conn_obj.base_api_url}/{conn_obj.repo_owner}/{conn_obj.repo_name}/pulls/{pr_number}/files"
    response = requests.get(url, headers=conn_obj.HEADERS, verify=False)
    if response.status_code == 200:
        files = [file["filename"] for file in response.json()]
        return files
    else:
        print(f"Failed to fetch files for PR #{pr_number}: {response.status_code}")
        return []

def parse_args():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("--gh-token", type=str, required=True, action="store")
    parser.add_argument("--repo-owner", type=str, required=True, action="store")
    parser.add_argument("--repo-name", type=str, required=True, action="store")
    parser.add_argument("--gh-api-baseurl", type=str, required=True, action="store")
    parser.add_argument("--pr-history-per-page", type=int, default=100, action="store")
    parser.add_argument("--pr-history-number-of-pages", type=int, default=1, action="store")

    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    gh_connection = GitHubConnection(args.gh_token, args.repo_owner, args.repo_name, args.gh_api_baseurl)
    pagination_data = PaginationData(args.pr_history_per_page, args.pr_history_number_of_pages)
    pr_numbers = get_pr_ids(gh_connection, pagination_data)
    
    changed_files_by_pr: dict = {}

    for pr in pr_numbers:
        print(f"Pull Request #{pr}:")
        files = get_modified_files_in_pr(gh_connection, pr)
        pr_info = {pr:
                   {'files': files, 
                    'expected_labels': ['tests-needed']}
                    }
        changed_files_by_pr.update(pr_info)
        if files:
            for file in files:
                print(f" - {file}")
        print("")

    with open("pr_statistics.json", "w") as target_file:
        json.dump(changed_files_by_pr, target_file)
