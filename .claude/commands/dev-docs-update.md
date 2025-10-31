# Documentation Update Command

You are tasked with analyzing recent code changes and updating relevant documentation to reflect the current state of the codebase.

## Step 1: Analyze Recent Changes

First, gather information about recent changes:

1. Run `git status` to see all modified and untracked files
2. Run `git log -5 --oneline --stat` to see the last 5 commits with file statistics
3. Run `git diff HEAD~5..HEAD` to see detailed changes from the last 5 commits
4. If there are uncommitted changes, run `git diff` to see them

## Step 2: Understand the Changes

For each modified file identified:

1. Read the current version of the file
2. Identify what has changed:
   - New features or components added
   - Removed functionality
   - Modified behavior or interfaces
   - Configuration changes
   - Dependency updates

Focus on **functional changes** that would impact documentation, such as:
- New API endpoints or methods
- Changed component interfaces or props
- Modified authentication flows
- Updated build configurations
- New environment variables or settings

## Step 3: Find Relevant Documentation

Search for documentation files that need updating:

1. Use Glob to find all markdown files in `Docs/**/*.md`
2. For each changed file/feature, search documentation for:
   - File names mentioned in docs
   - Component names
   - Feature names
   - Architecture diagrams or descriptions
   - Implementation status sections

Pay special attention to:
- Specification files (`Docs/Specs/`)
- Architecture documentation (`Docs/Architecture/`)
- Implementation summaries
- Status tracking documents
- The main `CLAUDE.md` file

## Step 4: Update Documentation

For each documentation file that needs updating:

1. **Implementation Status**: Update completion markers (❌ → ✅) and status descriptions
2. **Feature Descriptions**: Update to reflect current implementation details
3. **Code References**: Update file paths, line numbers, and function names
4. **Architecture Diagrams**: Update component relationships if structure changed
5. **Configuration**: Update environment variables, build settings, dependencies
6. **Testing Status**: Update test counts and coverage information
7. **Next Steps**: Update "Next Feature" or "TODO" sections

## Guidelines

- **Be Thorough**: Check all potentially affected documentation files
- **Be Accurate**: Verify information by reading the actual code files
- **Be Specific**: Include exact file paths, function names, and technical details
- **Preserve Format**: Maintain existing markdown structure and formatting
- **Cross-Reference**: Ensure consistency across multiple documentation files
- **Status Updates**: Update implementation status markers and completion checklists

## Output

Provide a summary of:
1. What code changes were found
2. Which documentation files were updated
3. What specific updates were made to each file
4. Any documentation gaps or inconsistencies discovered

Begin the analysis now.
