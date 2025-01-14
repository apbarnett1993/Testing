#!/usr/bin/env bash

# ---------------------------------------------------------
# Script: generate-combined.sh
# Purpose:
#   1) Ignore files/folders listed in file-ignore.txt
#   2) Output directory tree to directory_tree.txt
#   3) Append code to all_code.txt (separated by "=======")
#   4) Finally combine directory_tree.txt and all_code.txt
#      into a single file: combined_all.txt
# ---------------------------------------------------------

# --- 1. Build an "ignore" pattern list from file-ignore.txt ---
# If 'file-ignore.txt' is missing, create an empty one:
if [ ! -f file-ignore.txt ]; then
  touch file-ignore.txt
fi

IGNORE_PATTERNS=""

# For each line in file-ignore.txt, we build up an exclude pattern:
#   -not -path "*some-ignored-pattern*"
while IFS= read -r line; do
  # skip empty or comment lines
  if [[ -n "$line" && ! "$line" =~ ^# ]]; then
    IGNORE_PATTERNS+=" -not -path \"*${line}*\""
  fi
done < file-ignore.txt

# --- 2. Generate the directory listing (minus ignored items) ---
# We'll do this with 'find' so we can actually exclude paths.
# (If you absolutely need 'ls -R' format, you'd need a grep filter;
# but 'find' is more robust for exclusions.)

# Evaluate our dynamic string as part of the find command:
#   e.g. find . -not -path "*node_modules*" -not -path "*something-else*"
eval "find . $IGNORE_PATTERNS" > directory_tree.txt

# --- 3. Generate the concatenated code file (all_code.txt) ---
# Clear/create all_code.txt
> all_code.txt

# We'll gather only regular files (-type f), ignoring patterns.
while IFS= read -r filepath
do
  echo "=======" >> all_code.txt
  echo "# File: $filepath" >> all_code.txt
  cat "$filepath" >> all_code.txt
  echo "" >> all_code.txt
done < <(eval "find . $IGNORE_PATTERNS -type f")

# --- 4. Combine directory_tree.txt and all_code.txt into one file ---
cat directory_tree.txt all_code.txt > combined_all.txt

echo "DONE!"
echo "   - directory_tree.txt"
echo "   - all_code.txt"
echo "   - combined_all.txt (merged result)"
