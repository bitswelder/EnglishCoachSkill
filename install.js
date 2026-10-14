#!/usr/bin/env node
'use strict';

// Installs the english-coach skill into the user's Claude skills directory.
// No dependencies: Node builtins only, so `npx` starts instantly.

const fs = require('fs');
const os = require('os');
const path = require('path');

const SKILL_NAME = 'english-coach';
const SOURCE = __dirname;

const args = process.argv.slice(2);
const has = (...names) => names.some((n) => args.includes(n));

if (has('-h', '--help')) {
  console.log(`
  claude-english-coach — install the english-coach skill for Claude Code

  Usage:
    npx github:bitswelder/EnglishCoachSkill [options]

  Options:
    --auto          also add the every-message correction rule to ~/.claude/CLAUDE.md
    --dir <path>    install to a different skills directory
    --force         overwrite without asking
    -h, --help      show this
`);
  process.exit(0);
}

function flagValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const claudeDir = path.join(os.homedir(), '.claude');
const skillsDir = flagValue('--dir') || path.join(claudeDir, 'skills');
const target = path.join(skillsDir, SKILL_NAME);

const ok = (m) => console.log(`  \u2713 ${m}`);
const warn = (m) => console.log(`  ! ${m}`);
const fail = (m) => {
  console.error(`\n  \u2717 ${m}\n`);
  process.exit(1);
};

console.log(`\n  Installing ${SKILL_NAME}...\n`);

// Guard: never copy a directory onto itself (happens if run from inside an
// already-installed skill folder).
if (path.resolve(SOURCE) === path.resolve(target)) {
  ok(`already installed at ${target} — nothing to copy`);
  maybeWriteClaudeMd();
  done();
}

const payload = ['SKILL.md', 'references'];
for (const item of payload) {
  if (!fs.existsSync(path.join(SOURCE, item))) {
    fail(`missing ${item} in the package — the download looks incomplete`);
  }
}

const existed = fs.existsSync(target);
if (existed && !has('--force')) {
  warn(`${target} already exists — updating skill files in place`);
  warn('your mistakes-log.md will not be touched');
}

try {
  fs.mkdirSync(target, { recursive: true });
  for (const item of payload) {
    fs.cpSync(path.join(SOURCE, item), path.join(target, item), {
      recursive: true,
    });
  }
  ok(`${existed ? 'updated' : 'installed'} ${target}`);
} catch (err) {
  fail(`could not write to ${target}: ${err.message}`);
}

maybeWriteClaudeMd();
done();

function maybeWriteClaudeMd() {
  if (!has('--auto')) return;

  const file = path.join(claudeDir, 'CLAUDE.md');
  const heading = '## English corrections';
  const block = `
${heading}

The user is a non-native English speaker who wants to improve. Check the English of every
message they send, and begin your reply with the corrected version of their message:

\`> \u270f\ufe0f **<their whole message, rewritten correctly and naturally>**\`

- One line. Just the rewritten message — no table, no reasons, no grammar terms.
- Rewrite the whole message, not only the broken part, so they see the shape of a correct
  sentence. Keep their meaning, tone and length; do not make it more formal.
- Put it at the very top, as the first line of the reply, before anything else. Then
  answer normally. Never let it delay or displace the work they actually asked for.
- If the message is already correct, say nothing. No praise, no "looks good".
- Skip it entirely for fragments: pasted code, file paths, error messages, single words,
  and short commands like "yes", "do it", "continue".
- Explain a correction only if they ask why, or if they invoke \`/${SKILL_NAME}\` — that is
  where the full table, rule and drill belong.
- Append each error type to \`~/.claude/skills/${SKILL_NAME}/mistakes-log.md\` as
  \`- YYYY-MM-DD | <error type> | <their version> → <correct version>\`.
`;

  try {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (current.includes(heading)) {
      ok('CLAUDE.md already has the correction rule — left as is');
      return;
    }
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.appendFileSync(file, (current && !current.endsWith('\n') ? '\n' : '') + block);
    ok('added the every-message correction rule to CLAUDE.md');
  } catch (err) {
    warn(`could not update CLAUDE.md: ${err.message}`);
    warn('add the rule manually — see the README');
  }
}

function done() {
  console.log(`
  Restart Claude Code, then try:

    /${SKILL_NAME} I have some difficulties to write in english
${has('--auto') ? '' : `
  To have every message checked automatically, re-run with --auto
  or copy the CLAUDE.md block from the README.
`}`);
  process.exit(0);
}
