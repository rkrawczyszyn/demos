#!/bin/bash

# Load credentials from gitCredentials.txt
if [ -f /home/rkrawczyszyn/demos/dist/gitCredentials.txt ]; then
  source /home/rkrawczyszyn/demos/dist/gitCredentials.txt
else
  echo "Error: gitCredentials.txt file not found."
  exit 1
fi

# Ensure that GIT_USERNAME and GIT_TOKEN are set
if [ -z "$GIT_USERNAME" ] || [ -z "$GIT_TOKEN" ]; then
  echo "Error: GIT_USERNAME or GIT_TOKEN is not set in gitCredentials.txt."
  exit 1
fi

# Navigate to the desired directory
cd /home/rkrawczyszyn/demos/dist || exit 1

# Get the current date and time in YYYY-MM-DD HH:MM:SS format
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Stage all changed files (tracked and unstaged)
git add .

# Create a commit with the message 'updated at datetime.now'
git commit -m "updated at $DATE"

# Push the changes to the remote repository
git push https://$GIT_USERNAME:$GIT_TOKEN@github.com/rkrawczyszyn/demos.git

echo "Changes pushed with commit message: 'updated at $DATE'"
