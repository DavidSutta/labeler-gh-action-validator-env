import requests
import json
requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)

# Constants
TOKEN = ""
REPO_OWNER = ""
REPO_NAME = ""
BASE_API_URL = "https://api.github.com/repos"
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/json",
}
PER_PAGE=100 # MAX: 100!
HOW_MANY_PAGES=5

def get_pr_ids() -> list[str]:
    pr_ids: list[str] = list()

    for i in range(1, HOW_MANY_PAGES):
        url = f"{BASE_API_URL}/{REPO_OWNER}/{REPO_NAME}/pulls"
        response = requests.get(url, headers=HEADERS, verify=False, 
                                params={"state": "all",
                                        "per_page": PER_PAGE,
                                        "page": i
                                        })
        if response.ok:
            pr_ids.extend([pr["number"] for pr in response.json()])
        else:
            print(f"Failed to fetch PRs: {response.status_code}")

    return pr_ids

def get_modified_files_in_pr(pr_number: str) -> list[str]:
    url = f"{BASE_API_URL}/{REPO_OWNER}/{REPO_NAME}/pulls/{pr_number}/files"
    response = requests.get(url, headers=HEADERS, verify=False)
    if response.status_code == 200:
        files = [file["filename"] for file in response.json()]
        return files
    else:
        print(f"Failed to fetch files for PR #{pr_number}: {response.status_code}")
        return []

if __name__ == "__main__":
    pr_numbers = get_pr_ids()
    changed_files_by_pr: dict = {}

    for pr in pr_numbers:
        print(f"Pull Request #{pr}:")
        files = get_modified_files_in_pr(pr)
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
