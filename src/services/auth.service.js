const { supabaseAdmin, supabaseAnon } = require('../config/supabase')

async function registerUser({ email, password, fullName }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}

async function loginUser({ email, password }) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

module.exports = {
  registerUser,
  loginUser
}
