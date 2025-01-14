#!/usr/bin/env bash

# ---------------------------------------------------------
# Part A: Layout all files and folders in the directory
# ---------------------------------------------------------
# We'll save the directory tree into a file named "directory_tree.txt".
# The 'ls -R' command lists files recursively.
# Alternatively, you could use 'find .', or the 'tree' command (if installed).

ls -R > directory_tree.txt

# ---------------------------------------------------------
# Part B: Append the contents of each file to "all_code.txt"
#         separated by "======="
# ---------------------------------------------------------
# We'll create or overwrite "all_code.txt" initially.

> all_code.txt   # Clear or create the file

# We'll iterate over every file found in the current directory (recursively).
# Be mindful that binary files or large files might cause issues.

while IFS= read -r filepath
do
    # Append separator
    echo "=======" >> all_code.txt

    # (Optional) Indicate file name before its contents
    echo "# File: $filepath" >> all_code.txt
    
    # Append file contents
    cat "$filepath" >> all_code.txt
    
    # Add a line break
    echo "" >> all_code.txt
done < <(find . -type f)

# Done!
echo "Done creating directory_tree.txt and all_code.txt."
