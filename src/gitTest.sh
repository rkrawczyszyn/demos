#!/bin/bash

# Path to the repository and credentials
REPO_DIR="/home/rkrawczyszyn/demos/dist"
CREDENTIALS_FILE="/home/rkrawczyszyn/credentials/gitCredentials.json"

# Change directory to the repository
cd "$REPO_DIR" || exit 1

# Read credentials from JSON file
if [ -f "$CREDENTIALS_FILE" ]; then
    GIT_USERNAME=$(jq -r '.user' "$CREDENTIALS_FILE")
    GIT_TOKEN=$(jq -r '.token' "$CREDENTIALS_FILE")
else
    echo "Credentials file not found."
    exit 1
fi

echo $GIT_USERNAME
echo $GIT_TOKEN

# Validate credentials
# if [ -z "$GIT_USERNAME" ] || [ -z "$GIT_TOKEN" ]; then
#     echo "Git credentials are missing."
#     exit 1
# fi

# # Get the current date and time in YYYY-MM-DD HH:MM:SS format
# DATE=$(date +"%Y-%m-%d %H:%M:%S")

# # Stage all changed files (tracked and unstaged)
# git add .

# # Create a commit with the message 'updated at datetime'
# git commit -m "updated at $DATE"

# # Push the changes to the remote repository
# remote_repo="https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/rkrawczyszyn/demos.git"
# if ! git push "$remote_repo" main; then
#     echo "Failed to push changes."
#     exit 1
# fi

# echo "Changes pushed with commit message: 'updated at $DATE'"