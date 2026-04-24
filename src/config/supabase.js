const { createClient } = require("@supabase/supabase-js")

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria nao encontrada: ${name}`)
  }

  return value
}

const supabase = createClient(
  getRequiredEnv("SUPABASE_URL"),
  getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

module.exports = {
  supabase
}
