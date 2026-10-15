#!/usr/bin/env node
'use strict';

// Installs the english-coach skill for Claude Code and/or OpenAI Codex.
// Both read the same SKILL.md (Agent Skills format); only the install
// directory and the global instructions file differ.
// No dependencies: Node builtins only, so `npx` starts instantly.

const fs = require('fs');
const os = require('os');
const path = require('path');

const SKILL_NAME = 'english-coach';
const SOURCE = __dirname;
const HOME = os.homedir();

const args = process.argv.slice(2);
const has = (...names) => names.some((n) => args.includes(n));
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
};

if (has('-h', '--help')) {
  console.log(`
  claude-english-coach — install the english-coach skill

  Works with Claude Code and OpenAI Codex. By default it installs for every
  agent it finds on this machine.

  Usage:
    npx github:bitswelder/EnglishCoachSkill [options]

  Options:
    --claude        install for Claude Code only
    --codex         install for Codex only
    --auto          also add the every-message correction rule to the agent's
                    global instructions (CLAUDE.md / AGENTS.md)
    --dir <path>    install into this directory instead of the detected ones
    --force         overwrite without the "already exists" warning
    -h, --help      show this
`);
  process.exit(0);
}

// --- agent definitions -----------------------------------------------------

const codexHome = process.env.CODEX_HOME || path.join(HOME, '.codex');

const AGENTS = [
  {
    id: 'claude',
    label: 'Claude Code',
    home: path.join(HOME, '.claude'),
    skills: path.join(HOME, '.claude', 'skills'),
    instructions: path.join(HOME, '.claude', 'CLAUDE.md'),
  },
  {
    id: 'codex',
    label: 'Codex',
    home: codexHome,
    skills: path.join(codexHome, 'skills'),
    instructions: path.join(codexHome, 'AGENTS.md'),
  },
];

const ok = (m) => console.log(`  \u2713 ${m}`);
const warn = (m) => console.log(`  ! ${m}`);
const info = (m) => console.log(`    ${m}`);
const fail = (m) => {
  console.error(`\n  \u2717 ${m}\n`);
  process.exit(1);
};

// --- pick targets ----------------------------------------------------------

const PAYLOAD = ['SKILL.md', 'references'];
for (const item of PAYLOAD) {
  if (!fs.existsSync(path.join(SOURCE, item))) {
    fail(`missing ${item} in the package — the download looks incomplete`);
  }
}

let targets;
const customDir = flagValue('--dir');

if (customDir) {
  targets = [{ id: 'custom', label: 'custom directory', skills: customDir, instructions: null }];
} else {
  const asked = AGENTS.filter((a) => has(`--${a.id}`));
  if (asked.length) {
    targets = asked;
  } else {
    // Auto-detect: an agent counts as present if its home directory exists.
    targets = AGENTS.filter((a) => fs.existsSync(a.home));
    if (!targets.length) {
      warn('found neither ~/.claude nor ~/.codex on this machine');
      info('installing for Claude Code by default — pass --codex for Codex instead');
      targets = [AGENTS[0]];
    }
  }
}

console.log(`\n  Installing ${SKILL_NAME} for: ${targets.map((t) => t.label).join(', ')}\n`);

// --- install ---------------------------------------------------------------

for (const target of targets) {
  const dest = path.join(target.skills, SKILL_NAME);

  // Never copy a directory onto itself (happens when run from inside an
  // already-installed skill folder).
  if (path.resolve(SOURCE) === path.resolve(dest)) {
    ok(`${target.label}: already installed at ${dest} — nothing to copy`);
    writeInstructions(target);
    continue;
  }

  const existed = fs.existsSync(dest);
  if (existed && !has('--force')) {
    warn(`${target.label}: ${dest} exists — updating skill files, leaving mistakes-log.md alone`);
  }

  try {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of PAYLOAD) {
      fs.cpSync(path.join(SOURCE, item), path.join(dest, item), { recursive: true });
    }
    ok(`${target.label}: ${existed ? 'updated' : 'installed'} ${dest}`);
  } catch (err) {
    warn(`${target.label}: could not write to ${dest} — ${err.message}`);
    continue;
  }

  writeInstructions(target);
}

// --- every-message rule ----------------------------------------------------

function ruleBlock() {
  return `
## English corrections

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
- Explain a correction only if they ask why, or if they invoke the ${SKILL_NAME} skill —
  that is where the full table, rule and drill belong.
- Append each error type to \`mistakes-log.md\` in the skill's own directory as
  \`- YYYY-MM-DD | <error type> | <their version> → <correct version>\`.
`;
}

function writeInstructions(target) {
  if (!has('--auto') || !target.instructions) return;

  const file = target.instructions;
  const heading = '## English corrections';
  try {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (current.includes(heading)) {
      info(`${path.basename(file)} already has the correction rule — left as is`);
      return;
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, (current && !current.endsWith('\n') ? '\n' : '') + ruleBlock());
    ok(`${target.label}: added the correction rule to ${file}`);
  } catch (err) {
    warn(`${target.label}: could not update ${path.basename(file)} — ${err.message}`);
    info('add the rule by hand — see the README');
  }
}

// --- done ------------------------------------------------------------------

const names = targets.map((t) => t.id);
console.log(`
  Restart ${targets.map((t) => t.label).join(' and ')}, then try:
${names.includes('claude') ? `
    Claude Code:  /${SKILL_NAME} I have some difficulties to write in english` : ''}${names.includes('codex') ? `
    Codex:        ask it to "check my English with the ${SKILL_NAME} skill"` : ''}
${has('--auto') ? '' : `
  To have every message checked automatically, re-run with --auto.
`}`);
