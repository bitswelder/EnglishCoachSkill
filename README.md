# english-coach

A Claude Code skill that corrects your English and teaches you the rule behind each fix.
Built for non-native speakers who want to improve, not just get a clean sentence back.

## Install

```bash
npx github:<your-username>/english-coach
```

That copies the skill into `~/.claude/skills/english-coach`. Restart Claude Code and
`/english-coach` is available.

Add `--auto` to also install the every-message correction rule into your global
`~/.claude/CLAUDE.md`:

```bash
npx github:<your-username>/english-coach --auto
```

Options:

| Flag | Effect |
|---|---|
| `--auto` | also add the every-message correction rule to `~/.claude/CLAUDE.md` |
| `--dir <path>` | install to a different skills directory |
| `--force` | overwrite without the "already exists" warning |
| `--help` | usage |

Re-running the installer updates the skill files and never touches your
`mistakes-log.md`. Requires Node 16.7 or newer; it has no dependencies.

### Install by cloning instead

If you would rather have a git checkout you can edit and push from:

```bash
git clone https://github.com/<your-username>/english-coach.git ~/.claude/skills/english-coach
```

On Windows `cmd.exe`, use `"%USERPROFILE%\.claude\skills\english-coach"` as the target —
`$HOME` is not expanded there.

## Usage

Invoke it with the text you want checked:

```
/english-coach I have some difficulties to write in english
```

You get the corrected sentence, a table of what changed, the grammar rule behind the
main error, and a more natural phrasing.

It has five modes, picked automatically from what you ask:

| Ask | What you get |
|---|---|
| "is this correct?" / paste any text | Correction + rule + natural version |
| "how do I say X in English?" | Natural phrasing, plus formal and casual variants |
| "does this sound natural?" | A verdict, and what gave away the non-native phrasing |
| "how do I pronounce X?" | Plain respelling (`KUMF-ter-bul`), stress marked, no IPA |
| "check this email" | Correction + a flag if the tone lands blunt or over-formal |

Ask **"what are my common mistakes?"** for a summary of your recurring patterns.

## Automatic corrections on every message

The skill only runs when you invoke it. To have your English checked on *every* message
you send, either install with `--auto` (above) or add this to your global
`~/.claude/CLAUDE.md` by hand:

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
- Explain a correction only if they ask why, or if they invoke `/english-coach` — that is
  where the full table, rule and drill belong.
- Append each error type to `~/.claude/skills/english-coach/mistakes-log.md` as
  `- YYYY-MM-DD | <error type> | <their version> → <correct version>`.
```

`CLAUDE.md` is read at session start, so the change applies from your next session.

## Mistake tracking

Corrections are appended to `mistakes-log.md` in this folder. Once an error type appears
three times, the skill stops explaining it and gives you a drill instead.

That file is **gitignored** — your own log stays private and does not sync. If you want
it to follow you between machines, remove it from `.gitignore`, but remember it will then
be visible to anyone who can see the repo.

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
install.js                          the npx installer, no dependencies
references/pt-speaker-pitfalls.md   13 Portuguese→English traps with causes
mistakes-log.md                     your personal error log (gitignored)
```
