#!/bin/bash

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
