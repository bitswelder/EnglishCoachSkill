# english-coach

A skill that corrects your English and teaches you the rule behind each fix.
Built for non-native speakers who want to improve, not just get a clean sentence back.

Works with **Claude Code** and **OpenAI Codex** — both read the same `SKILL.md`.

## Install

```bash
npx github:bitswelder/EnglishCoachSkill
```

It detects which agents you have and installs for each of them:

| Agent | Installs to |
|---|---|
| Claude Code | `~/.claude/skills/english-coach` |
| Codex | `~/.codex/skills/english-coach` (or `$CODEX_HOME/skills`) |

Restart the agent afterwards so it picks up the new skill.

Add `--auto` to also install the every-message correction rule into the agent's global
instructions — `~/.claude/CLAUDE.md` for Claude, `~/.codex/AGENTS.md` for Codex:

```bash
npx github:bitswelder/EnglishCoachSkill --auto
```

Options:

| Flag | Effect |
|---|---|
| `--claude` | install for Claude Code only |
| `--codex` | install for Codex only |
| `--auto` | also add the every-message correction rule to `CLAUDE.md` / `AGENTS.md` |
| `--dir <path>` | install into a specific directory instead of the detected ones |
| `--force` | overwrite without the "already exists" warning |
| `--help` | usage |

Re-running is safe: it updates the skill files, never touches your `mistakes-log.md`, and
will not add the correction rule twice. Requires Node 16.7 or newer; no dependencies.

### Install by cloning instead

If you would rather have a git checkout you can edit and push from:

```bash
git clone https://github.com/bitswelder/EnglishCoachSkill.git ~/.claude/skills/english-coach
```

Note the target folder is `english-coach`, not `EnglishCoachSkill` — both agents match a
skill by its folder name, so cloning into a differently named folder stops it from being
found. For Codex, clone into `~/.codex/skills/english-coach` instead.

On Windows `cmd.exe`, use `"%USERPROFILE%\.claude\skills\english-coach"` as the target —
`$HOME` is not expanded there.

## Usage

**Claude Code** exposes it as a slash command:

```
/english-coach I have some difficulties to write in english
```

**Codex** selects skills by their description, so just ask:

```
check my English: I have some difficulties to write in english
```

If it does not pick the skill up, name it: *"use the english-coach skill on this"*.

Either way you get the corrected sentence, a table of what changed, the grammar rule
behind the main error, and a more natural phrasing.

Five modes, chosen automatically from what you ask:

| Ask | What you get |
|---|---|
| "is this correct?" / paste any text | Correction + rule + natural version |
| "how do I say X in English?" | Natural phrasing, plus formal and casual variants |
| "does this sound natural?" | A verdict, and what gave away the non-native phrasing |
| "how do I pronounce X?" | Plain respelling (`KUMF-ter-bul`), stress marked, no IPA |
| "check this email" | Correction + a flag if the tone lands blunt or over-formal |

Ask **"what are my common mistakes?"** for a summary of your recurring patterns.

## Automatic corrections on every message

The skill only runs when invoked. To have your English checked on *every* message you
send, install with `--auto`, or add this by hand to `~/.claude/CLAUDE.md` (Claude Code)
or `~/.codex/AGENTS.md` (Codex):

```markdown
## English corrections

The user is a non-native English speaker who wants to improve. Check the English of every
message they send, and begin your reply with the corrected version of their message:

`> ✏️ **<their whole message, rewritten correctly and naturally>**`

- One line. Just the rewritten message — no table, no reasons, no grammar terms.
- Rewrite the whole message, not only the broken part, so they see the shape of a correct
  sentence. Keep their meaning, tone and length; do not make it more formal.
- Put it at the very top, as the first line of the reply, before anything else. Then
  answer normally. Never let it delay or displace the work they actually asked for.
- If the message is already correct, say nothing. No praise, no "looks good".
- Skip it entirely for fragments: pasted code, file paths, error messages, single words,
  and short commands like "yes", "do it", "continue".
- Explain a correction only if they ask why, or if they invoke the english-coach skill —
  that is where the full table, rule and drill belong.
- Append each error type to `mistakes-log.md` in the skill's own directory as
  `- YYYY-MM-DD | <error type> | <their version> → <correct version>`.
```

Both files are read at session start, so the change applies from your next session.

## Mistake tracking

Corrections are appended to `mistakes-log.md` inside the skill folder. Once an error type
appears three times, the skill stops explaining it and gives you a drill instead.

That file is **gitignored** — your own log stays private and does not sync. If you want it
to follow you between machines, remove it from `.gitignore`, but remember it will then be
visible to anyone who can see the repo. Note that Claude and Codex each keep their own
copy, since each has its own skill folder.

## Adapting it to another first language

The skill is tuned for Portuguese speakers: `references/pt-speaker-pitfalls.md` lists the
mistakes that come from Portuguese sentence structure, and `SKILL.md` names Portuguese as
the first language.

To adapt it, replace that reference file with the equivalent pitfalls for your language
and update the two mentions of Portuguese in `SKILL.md`. The output format, modes and
mistake tracking are language-independent.

## Files

```
SKILL.md                            the skill itself: rules, output format, modes
install.js                          the installer, no dependencies
references/pt-speaker-pitfalls.md   13 Portuguese→English traps with causes
mistakes-log.md                     your personal error log (gitignored)
```

## Licence

MIT
