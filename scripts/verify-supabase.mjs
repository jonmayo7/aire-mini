import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function verify() {
  const { data, error } = await supabase.from('cycles').select('*').limit(1)
  console.log({ data, error })
}

verify().catch(console.error)