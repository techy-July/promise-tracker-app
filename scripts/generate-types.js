#!/usr/bin/env node

/**
 * Script to generate Supabase types and wire up the typed client
 *
 * Run this after authenticating with Supabase:
 * 1. npx supabase login
 * 2. npm run generate:types
 */

// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { spawnSync } = require('node:child_process')
const fs = require('node:fs')

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID
const OUTPUT_FILE = 'src/lib/database.types.ts'

// Validate PROJECT_ID is set
if (!PROJECT_ID) {
	console.error('❌ SUPABASE_PROJECT_ID environment variable is not set')
	process.exit(1)
}

console.log('📋 Generating Supabase TypeScript types...')

const result = spawnSync(
	'npx',
	['supabase', 'gen', 'types', 'typescript', '--project-id', PROJECT_ID],
	{
		encoding: 'utf-8',
		stdio: ['pipe', 'pipe', 'pipe'],
		shell: true,
	}
)

if (result.error) {
	console.error('❌ Error running supabase CLI:', result.error.message)
	console.log("\n💡 Make sure you're authenticated:")
	console.log('   npx supabase login')
	process.exit(1)
}

if (result.status !== 0) {
	console.error('❌ Type generation failed:', result.stderr)
	console.log("\n💡 Make sure you're authenticated:")
	console.log('   npx supabase login')
	process.exit(1)
}

// Write the generated types to file
try {
	fs.writeFileSync(OUTPUT_FILE, result.stdout, 'utf-8')
	console.log(`✅ Successfully generated types: ${OUTPUT_FILE}`)
	console.log('\n📝 Next steps:')
	console.log('   1. Import typed clients in your files:')
	console.log(
		'      • Client components: import { createTypedBrowserClient } from "@/lib/supabase-typed-client"'
	)
	console.log(
		'      • Server components: import { createTypedServerClient } from "@/lib/supabase-typed-server"'
	)
	console.log('\n   2. Use them with full type safety:')
	console.log('      const supabase = createTypedBrowserClient()')
	console.log('      const { data } = await supabase.from("yourTable").select("*")')
	process.exit(0)
} catch (error) {
	console.error(`❌ Error writing types to ${OUTPUT_FILE}:`, error.message)
	process.exit(1)
}
