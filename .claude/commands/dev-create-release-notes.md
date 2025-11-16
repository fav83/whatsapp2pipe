# Create Release Notes

Automate the creation of release notes for a new version.

## Steps

1. **Read Extension Version:**
   - Read `Extension/manifest.json` and extract the `version` field
   - Print the version to the user: "Found version X.X.X in Extension/manifest.json"
   - Ask: "Do you want to use this version as the release number? (yes/no)"
   - Wait for user confirmation
   - If user says no, stop the process

2. **Find Previous Release:**
   - Read `RELEASE-NOTES.md` in the project root
   - Find the most recent release version (look for `# Release X.X.X` pattern)
   - Print: "Previous release found: X.X.X"
   - Run: `git fetch origin` to fetch latest branches from remote
   - Look for the corresponding release branch: `releases/X.X.X`
   - Run: `git branch -a | grep releases/` to verify the branch exists
   - If the previous release branch is NOT found:
     - Print: "Error: Previous release branch 'releases/X.X.X' not found in git"
     - Stop the process

3. **Compare Changes:**
   - Run: `git log origin/releases/[previous_version]..master --oneline`
   - Analyze all commits since the previous release
   - Create a concise, user-friendly description of changes
   - Group related changes together
   - Focus on features, fixes, and improvements (skip minor/internal changes)

4. **Update Release Notes:**
   - Read current `RELEASE-NOTES.md`
   - Prepend new release section at the top:
     ```
     # Release [new_version]

     [Concise description of changes]

     ```
   - Preserve all existing content below
   - Write the updated content back to `RELEASE-NOTES.md`
   - Show the user what was added

5. **Create Release Branch:**
   - Run: `git checkout -b releases/[new_version]`
   - Print: "Created new release branch: releases/[new_version]"

6. **Commit Release Notes:**
   - Run: `git add RELEASE-NOTES.md`
   - Run: `git commit -m "Release [new_version]"`
   - Print: "Committed updated RELEASE-NOTES.md"

7. **Push and Sync Release Branch:**
   - Run: `git push -u origin releases/[new_version]`
   - Print: "Pushed and synced release branch to origin"

8. **Merge to Master:**
   - Run: `git checkout master`
   - Run: `git merge releases/[new_version] --no-ff -m "Merge release [new_version] notes"`
   - Print: "Merged release notes to master"
   - Run: `git push origin master`
   - Print: "Pushed master to origin"

9. **Summary:**
   - Print final summary:
     ```
     ✓ Release notes created for version [new_version]
     ✓ Release branch: releases/[new_version]
     ✓ Changes committed and pushed
     ✓ Merged to master

     Next steps:
     - Review the release notes in RELEASE-NOTES.md
     - Continue with your release process
     ```

## Error Handling

- If any git command fails, stop immediately and inform the user
- If there are uncommitted changes in the working directory, warn the user before proceeding
- If the release branch already exists, stop and inform the user
