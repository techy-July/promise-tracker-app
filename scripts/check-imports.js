#!/usr/bin/env node

// Script to check and fix relative imports in the Next.js project
// Converts relative imports (./src/file) to absolute imports (@/file)
// Usage: node scripts/check-imports.js [--fix]

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

// ANSI color codes for console output
const COLORS = {
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	green: "\x1b[32m",
	cyan: "\x1b[36m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

// Helper function to log colored messages
function log(message, color = "") {
	console.log(`${color}${message}${COLORS.reset}`);
}

// Main function to check and optionally fix relative imports
function checkRelativeImports(shouldFix = false) {
	try {
		const violations = findRelativeImports();

		if (!violations || Object.keys(violations).length === 0) {
			log(
				"✅ No relative imports found! All imports are using @ aliases.",
				COLORS.green,
			);
			return true;
		}

		if (shouldFix) {
			return fixRelativeImports(violations);
		}

		displayViolations(violations);
		return false;
	} catch (error) {
		log(`❌ Error checking imports: ${error.message}`, COLORS.red);
		return false;
	}
}

// Find ripgrep executable
function findRipgrepPath() {
	const fallbacks = ["rg", "/usr/local/bin/rg", "/opt/homebrew/bin/rg"];

	for (const rgPath of fallbacks) {
		try {
			const testResult = spawnSync(rgPath, ["--version"], {
				encoding: "utf-8",
			});
			if (testResult.status === 0) {
				return rgPath;
			}
		} catch {}
	}

	throw new Error(
		"ripgrep (rg) not found in PATH. Install it from https://github.com/BurntSushi/ripgrep",
	);
}

// Search for relative imports in the codebase
function findRelativeImports() {
	const rgPath = findRipgrepPath();

	const rgOptions = [
		"--type-add",
		"web:*.{ts,tsx,js,jsx}",
		"--type",
		"web",
		"--line-number",
		"--no-heading",
		"--color=never",
		"--glob",
		"!**/node_modules/**",
		"--glob",
		"!**/.next/**",
		"--glob",
		"!**/dist/**",
	];

	// Pattern to match relative imports
	const patterns = [
		"from ['\"]\\.\\./", // from '../...'
		"from ['\"]\\.\\/[^@]", // from './file' (but not './auth/callback')
		"require\\(['\"]\\.\\./", // require('../...')
		"require\\(['\"]\\.\\/[^@]", // require('./file')
	];

	const groupedViolations = {};

	for (const pattern of patterns) {
		const result = spawnSync(rgPath, [...rgOptions, pattern, "src/"], {
			encoding: "utf-8",
		});

		if (result.status === 0 && result.stdout) {
			const lines = result.stdout.trim().split("\n");
			lines.forEach((line) => {
				const [filePath, lineNumber, ...codeParts] = line.split(":");
				const code = codeParts.join(":").trim();

				if (!groupedViolations[filePath]) {
					groupedViolations[filePath] = [];
				}

				// Avoid duplicates
				const exists = groupedViolations[filePath].some(
					(v) =>
						v.lineNumber === Number.parseInt(lineNumber) && v.code === code,
				);
				if (!exists) {
					groupedViolations[filePath].push({
						lineNumber: Number.parseInt(lineNumber),
						code,
					});
				}
			});
		}
	}

	return Object.keys(groupedViolations).length > 0 ? groupedViolations : null;
}

// Display violations to the user
function displayViolations(groupedViolations) {
	log(
		"❌ Relative imports found that should use @ alias:",
		COLORS.red + COLORS.bold,
	);
	log("", "");

	let totalViolations = 0;

	Object.entries(groupedViolations).forEach(([filePath, violations]) => {
		log(`📁 ${filePath}`, COLORS.cyan + COLORS.bold);
		violations.forEach(({ lineNumber, code }) => {
			log(`   Line ${lineNumber}: ${code.substring(0, 80)}`, COLORS.yellow);
			totalViolations++;
		});
		log("", "");
	});

	log(`Total violations: ${totalViolations}`, COLORS.yellow + COLORS.bold);
	log("ℹ️  Path alias configuration:", COLORS.cyan);
	log("   @ = ./src/", COLORS.cyan);
	log("", "");
	log("💡 Examples:", COLORS.green);
	log('   ❌ import x from "./lib/helper"', COLORS.red);
	log('   ✅ import x from "@/lib/helper"', COLORS.green);
	log("", "");
	log('   ❌ import x from "../utils"', COLORS.red);
	log('   ✅ import x from "@/utils"', COLORS.green);
	log("", "");
	log("💡 Run with --fix flag to auto-fix these imports", COLORS.green);
	log("   npm run lint:imports:fix", COLORS.cyan);
	log("", "");
}

// Fix relative imports by converting them to absolute imports
function fixRelativeImports(violations) {
	let totalFixed = 0;
	let filesModified = 0;

	log("🔧 Fixing relative imports...", COLORS.cyan + COLORS.bold);
	log("", "");

	for (const [filePath, fileViolations] of Object.entries(violations)) {
		const fixedCount = fixFileImports(filePath, fileViolations);
		if (fixedCount > 0) {
			filesModified++;
			totalFixed += fixedCount;
		}
	}

	const success = totalFixed > 0;
	const message = success
		? `✅ Successfully fixed ${totalFixed} relative imports in ${filesModified} files!`
		: "ℹ️  No imports were fixed.";

	log(message, success ? COLORS.green + COLORS.bold : COLORS.yellow);
	return success;
}

// Fix imports in a single file
function fixFileImports(filePath, violations) {
	try {
		let fileContent = fs.readFileSync(filePath, "utf-8");
		let fixedCount = 0;

		// Sort by line number descending to avoid line shifts
		const sortedViolations = violations.sort(
			(a, b) => b.lineNumber - a.lineNumber,
		);

		for (const { lineNumber, code } of sortedViolations) {
			const lines = fileContent.split("\n");
			const originalLine = lines[lineNumber - 1];

			if (originalLine) {
				const fixedLine = convertImportLine(filePath, originalLine);
				if (fixedLine && fixedLine !== originalLine) {
					lines[lineNumber - 1] = fixedLine;
					fileContent = lines.join("\n");
					fixedCount++;

					log(`   ✅ Line ${lineNumber}`, COLORS.yellow);
					log(`      from: ${code.trim()}`, COLORS.red);
					log(`      to:   ${fixedLine.trim()}`, COLORS.green);
				}
			}
		}

		if (fixedCount > 0) {
			fs.writeFileSync(filePath, fileContent, "utf-8");
			log(
				`📁 Fixed ${fixedCount} import(s) in ${filePath}`,
				COLORS.green + COLORS.bold,
			);
			log("", "");
		}

		return fixedCount;
	} catch (error) {
		log(`❌ Error fixing ${filePath}: ${error.message}`, COLORS.red);
		return 0;
	}
}

// Convert a line with relative import to absolute import
function convertImportLine(filePath, line) {
	// Match: from './...' or from '../...'
	const importMatch = line.match(
		/(.*from\s+)(['"])(\.\.[^'"]*|\.\/[^'"]*)(['"])(.*)/,
	);
	if (importMatch) {
		const [, prefix, quote, relativePath, , suffix] = importMatch;
		const absolutePath = convertToAbsolutePath(filePath, relativePath);
		if (absolutePath) {
			return `${prefix}${quote}${absolutePath}${quote}${suffix}`;
		}
	}

	// Match: require('./...') or require('../...')
	const requireMatch = line.match(
		/(.*require\s*\(\s*)(['"])(\.\.[^'"]*|\.\/[^'"]*)(['"])(.*)/,
	);
	if (requireMatch) {
		const [, prefix, quote, relativePath, , suffix] = requireMatch;
		const absolutePath = convertToAbsolutePath(filePath, relativePath);
		if (absolutePath) {
			return `${prefix}${quote}${absolutePath}${quote}${suffix}`;
		}
	}

	return null;
}

// Convert relative path to absolute @ alias
function convertToAbsolutePath(filePath, relativePath) {
	// Get the directory of the current file
	const currentDir = path.dirname(filePath);

	// Resolve the relative path
	const resolvedPath = path.resolve(currentDir, relativePath);

	// Find the src directory
	const srcIndex = resolvedPath.indexOf(path.sep + "src" + path.sep);
	if (srcIndex === -1) {
		// Try to handle case where src is at the beginning
		const srcMatch = resolvedPath.match(/.*[/\\]src[/\\](.*)/);
		if (srcMatch) {
			const relativeTo = srcMatch[1].replace(/\\/g, "/");
			return `@/${relativeTo}`;
		}
		return null;
	}

	// Get path relative to src/
	const relativeToSrc = resolvedPath.substring(srcIndex + 5); // +5 to skip '/src/'
	const normalized = relativeToSrc.replace(/\\/g, "/");

	return `@/${normalized}`;
}

// Run when executed directly
if (require.main === module) {
	const shouldFix = process.argv.includes("--fix");
	const success = checkRelativeImports(shouldFix);
	process.exit(success ? 0 : 1);
}

module.exports = { checkRelativeImports };
