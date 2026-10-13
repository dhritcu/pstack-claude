#!/usr/bin/env node
// Print the main-session transcript whose opening user prompt contains a
// fragment. Searches only <config>/projects/<encoded-cwd>/, never other
// workspaces' chats.
//
// Usage: node find-transcript.mjs [--cwd <dir>] "<fragment of the opening prompt>"
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";

// Text of these records is Claude Code's own markup for a local command or a
// `!` shell command, not a prompt.
const LOCAL_MARKUP =
	/^<(local-command-caveat|command-name|command-message|command-args|local-command-stdout|local-command-stderr|bash-input|bash-stdout|bash-stderr)>/;
const COMMAND_NAME = /<command-name>\s*\/?([^<]*?)\s*<\/command-name>/;
const COMMAND_ARGS = /<command-args>([\s\S]*?)<\/command-args>/;

const normalize = (text) => text.replace(/\s+/g, " ").trim().toLowerCase();
const encode = (dir) => dir.replace(/[^a-zA-Z0-9]/g, "-");

function fail(message) {
	process.stderr.write(`find-transcript: ${message}\n`);
	process.exit(1);
}

function parseArgs(argv) {
	let cwd = process.cwd();
	const rest = [];
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--cwd") {
			if (i + 1 >= argv.length) fail("--cwd needs a directory");
			cwd = argv[++i];
		} else if (argv[i] === "-h" || argv[i] === "--help") {
			process.stdout.write('usage: find-transcript.mjs [--cwd <dir>] "<prompt fragment>"\n');
			process.exit(0);
		} else rest.push(argv[i]);
	}
	const fragment = normalize(rest.join(" "));
	if (!fragment) fail('missing prompt fragment; usage: find-transcript.mjs [--cwd <dir>] "<fragment>"');
	return { cwd, fragment };
}

// Claude Code keys a project by its physical path; long encodings are cut at
// 200 characters and given a hash suffix.
function projectDirs(cwd) {
	const projects = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude"), "projects");
	const resolved = path.resolve(cwd);
	let real = resolved;
	try {
		real = fs.realpathSync(resolved);
	} catch {}
	const names = new Set([encode(real), encode(resolved)]);
	let entries = [];
	try {
		entries = fs.readdirSync(projects);
	} catch {
		return { projects, dirs: [], expected: [...names] };
	}
	const dirs = entries
		.filter((entry) => [...names].some((name) => entry === name || (name.length > 200 && entry.startsWith(name.slice(0, 200)))))
		.map((entry) => path.join(projects, entry));
	return { projects, dirs, expected: [...names] };
}

function recordText(record) {
	const content = record.message?.content;
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return null;
	const texts = content.filter((part) => part?.type === "text" && typeof part.text === "string");
	return texts.length ? texts.map((part) => part.text).join("\n") : null;
}

// The first prompt the user wrote: skip metadata, local and shell command
// markup, tool results, and compaction summaries. A skill invoked as a slash
// command counts through its arguments; a built-in command (followed by its
// stdout) and an argument-less command do not.
async function openingPrompt(file) {
	const lines = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
	let command = null;
	try {
		for await (const line of lines) {
			if (!line.includes('"user"')) continue;
			let record;
			try {
				record = JSON.parse(line);
			} catch {
				continue;
			}
			if (record.type !== "user") continue;
			if (record.isSidechain) return null;
			if (record.isMeta || record.isCompactSummary) continue;
			const text = recordText(record);
			if (text === null) continue;
			const trimmed = text.trimStart();
			if (command !== null) {
				if (trimmed.startsWith("<local-command-stdout>") || trimmed.startsWith("<local-command-stderr>")) {
					command = null;
					continue;
				}
				return command;
			}
			if (COMMAND_NAME.test(trimmed)) {
				const args = COMMAND_ARGS.exec(trimmed)?.[1]?.trim() ?? "";
				if (args) command = args;
				continue;
			}
			if (LOCAL_MARKUP.test(trimmed)) continue;
			if (trimmed) return text;
		}
	} finally {
		lines.close();
	}
	return command;
}

const { cwd, fragment } = parseArgs(process.argv.slice(2));
const { projects, dirs, expected } = projectDirs(cwd);
if (dirs.length === 0) fail(`no transcripts for ${cwd}: ${expected.map((name) => path.join(projects, name)).join(" or ")} does not exist`);

const candidates = [];
for (const dir of dirs)
	for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
		if (entry.isFile() && entry.name.endsWith(".jsonl") && !entry.name.startsWith("agent-")) {
			const file = path.join(dir, entry.name);
			candidates.push({ file, mtime: fs.statSync(file).mtimeMs });
		}
candidates.sort((a, b) => b.mtime - a.mtime);

for (const { file } of candidates) {
	const prompt = await openingPrompt(file);
	if (prompt !== null && normalize(prompt).includes(fragment)) {
		process.stdout.write(`${file}\n`);
		process.exit(0);
	}
}
fail(`no session in ${dirs.join(", ")} opens with a prompt containing "${fragment}" (${candidates.length} transcripts checked)`);
