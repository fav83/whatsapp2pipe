# Line Endings Policy (LF Only)

- Use LF for all text files across all platforms.
- Do not commit CRLF. Configure Git and editors to write LF.
- Normalize existing files and keep CI checks to prevent regressions.

## Repo Settings

Create or update the following files at the repo root.

### .gitattributes
```
* text=auto eol=lf

# Text files
*.md      text eol=lf
*.txt     text eol=lf
*.json    text eol=lf
*.yaml    text eol=lf
*.yml     text eol=lf
*.env     text eol=lf
*.ts      text eol=lf
*.tsx     text eol=lf
*.js      text eol=lf
*.css     text eol=lf
*.scss    text eol=lf
*.cs      text eol=lf
*.csproj  text eol=lf
*.sln     text eol=lf

# Binaries
*.png  binary
*.jpg  binary
*.jpeg binary
*.gif  binary
*.webp binary
*.ico  binary
*.pdf  binary
*.zip  binary
*.mp4  binary
```

### .editorconfig
```
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
```

## One-Time Normalization (commit once)

- Ensure Git uses LF locally:
  - `git config core.autocrlf false`
  - `git config core.eol lf`
- Renormalize and commit:
  - `git add --renormalize .`
  - `git commit -m "Normalize line endings to LF and enforce via .gitattributes"`

## CI/Guard (optional)

Fail CI if CRLF is present in tracked text files.

- ripgrep check example:
  - `rg -nU "\r$" --glob '!**/*.png' --glob '!**/*.jpg' --glob '!**/*.jpeg' --glob '!**/*.gif' --glob '!**/*.webp' --glob '!**/*.ico' --glob '!**/*.pdf' --glob '!**/*.zip' --glob '!**/*.mp4' . && echo "CRLF found" && exit 1 || echo "No CRLF"`
- Or use pre-commit hooks with `mixed-line-ending` and `end-of-file-fixer`.

## Contributor Notes

- On Windows, set Git:
  - `git config --global core.autocrlf false`
- VS Code users: set in settings.json
  - `"files.eol": "\n"`

## Integration with Project Docs

- Reference this policy from `CLAUDE.md` and team onboarding docs.
