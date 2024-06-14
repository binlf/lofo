#!/bin/bash

# Old and new GitHub usernames
OLD_USERNAME="pi-xlz"
NEW_USERNAME="pixlbin"

# Path to the directory containing your repositories
REPO_BASE_DIR=~/Documents/Prjs/[projects]/projects-original/[WIP]

# Iterate over each directory (assuming each directory is a git repository)
for dir in "$REPO_BASE_DIR"/*/; do
  cd "$dir"
  if [ -d ".git" ]; then
    echo "Updating remote URL in $dir"
    git remote set-url origin $(git remote get-url origin | sed "s/$OLD_USERNAME/$NEW_USERNAME/")
  else
    echo "Skipping $dir, not a git repository"
  fi
done