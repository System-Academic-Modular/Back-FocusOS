const { supabase } = require("../config/supabase")
const { handleDatabaseError } = require("../utils/database")

function extractToken(req) {
  const authorizationHeader = req.headers.authorization || ""

  if (authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim()
  }

  return req.headers["x-session-token"]
}

async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({
        error: "Token de sessao nao informado"
      })
    }

    const sessionResponse = await supabase
      .from("sessao_login")
      .select("*")
      .eq("token", token)
      .maybeSingle()

    handleDatabaseError(sessionResponse.error)

    if (!sessionResponse.data) {
      return res.status(401).json({
        error: "Sessao invalida ou expirada"
      })
    }

    const loginResponse = await supabase
      .from("login")
      .select("id_login, key_login, data_criacao, data_atualizacao, email, id_usuario")
      .eq("id_login", sessionResponse.data.id_login)
      .maybeSingle()

    handleDatabaseError(loginResponse.error)

    if (!loginResponse.data) {
      return res.status(401).json({
        error: "Login nao encontrado para a sessao informada"
      })
    }

    const userResponse = await supabase
      .from("usuario")
      .select("*")
      .eq("id_usuario", loginResponse.data.id_usuario)
      .maybeSingle()

    handleDatabaseError(userResponse.error)

    req.auth = {
      token,
      session: sessionResponse.data,
      login: loginResponse.data,
      user: userResponse.data,
      idLogin: loginResponse.data.id_login,
      idUsuario: loginResponse.data.id_usuario
    }

    next()
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Erro interno ao validar a sessao"
    })
  }
}

module.exports = authMiddleware
