const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const {
  generatePublicKey,
  generateSessionToken,
  hashPassword,
  verifyPassword,
  sanitizeLogin,
  sanitizeUser,
  sanitizeSession
} = require("../utils/security")

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase()
}

function validateCredentials(email, password) {
  if (!email || !password) {
    throw createAppError(400, "Email e senha sao obrigatorios")
  }

  if (String(password).length < 6) {
    throw createAppError(400, "A senha deve ter pelo menos 6 caracteres")
  }
}

async function getUserById(idUsuario) {
  const response = await supabase
    .from("usuario")
    .select("*")
    .eq("id_usuario", idUsuario)
    .maybeSingle()

  handleDatabaseError(response.error)
  return response.data
}

async function getLoginByEmail(email) {
  const response = await supabase
    .from("login")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle()

  handleDatabaseError(response.error)
  return response.data
}

async function getLoginById(idLogin) {
  const response = await supabase
    .from("login")
    .select("*")
    .eq("id_login", idLogin)
    .maybeSingle()

  handleDatabaseError(response.error)
  return response.data
}

async function buildAccountPayload(login, session = null) {
  const user = await getUserById(login.id_usuario)

  return {
    login: sanitizeLogin(login),
    user: sanitizeUser(user),
    session: sanitizeSession(session)
  }
}

async function registerUser({ email, password, fullName, avatarUrl }) {
  validateCredentials(email, password)

  const userResponse = await supabase
    .from("usuario")
    .insert({
      key_usuario: generatePublicKey("usuario"),
      nome_completo: fullName || null,
      avatar_url: avatarUrl || null
    })
    .select("*")
    .single()

  handleDatabaseError(userResponse.error)

  const loginResponse = await supabase
    .from("login")
    .insert({
      key_login: generatePublicKey("login"),
      email: normalizeEmail(email),
      senha: hashPassword(password),
      id_usuario: userResponse.data.id_usuario
    })
    .select("*")
    .single()

  if (loginResponse.error) {
    await supabase.from("usuario").delete().eq("id_usuario", userResponse.data.id_usuario)
    handleDatabaseError(loginResponse.error)
  }

  const account = await buildAccountPayload(loginResponse.data)

  return {
    login: account.login,
    user: account.user
  }
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createAppError(400, "Email e senha sao obrigatorios")
  }

  const login = await getLoginByEmail(email)

  if (!login || !verifyPassword(password, login.senha)) {
    throw createAppError(401, "Email ou senha invalidos")
  }

  const sessionResponse = await supabase
    .from("sessao_login")
    .insert({
      key_sessao_login: generatePublicKey("sessao"),
      token: generateSessionToken(),
      id_login: login.id_login
    })
    .select("*")
    .single()

  handleDatabaseError(sessionResponse.error)

  return buildAccountPayload(login, sessionResponse.data)
}

async function getCurrentAccount(auth) {
  const login = await getLoginById(auth.idLogin)

  if (!login) {
    throw createAppError(404, "Login nao encontrado")
  }

  return buildAccountPayload(login, auth.session)
}

async function updateCurrentAccount(auth, payload) {
  const loginUpdates = {}
  const userUpdates = {}

  if (payload.email !== undefined) {
    loginUpdates.email = normalizeEmail(payload.email)
  }

  if (payload.password !== undefined) {
    validateCredentials(auth.login.email, payload.password)
    loginUpdates.senha = hashPassword(payload.password)
  }

  if (payload.fullName !== undefined) {
    userUpdates.nome_completo = payload.fullName
  }

  if (payload.avatarUrl !== undefined) {
    userUpdates.avatar_url = payload.avatarUrl
  }

  if (Object.keys(loginUpdates).length === 0 && Object.keys(userUpdates).length === 0) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  if (Object.keys(loginUpdates).length > 0) {
    loginUpdates.data_atualizacao = new Date().toISOString()

    const loginResponse = await supabase
      .from("login")
      .update(loginUpdates)
      .eq("id_login", auth.idLogin)
      .select("*")
      .single()

    handleDatabaseError(loginResponse.error)
  }

  if (Object.keys(userUpdates).length > 0) {
    userUpdates.data_atualizacao = new Date().toISOString()

    const userResponse = await supabase
      .from("usuario")
      .update(userUpdates)
      .eq("id_usuario", auth.idUsuario)
      .select("*")
      .single()

    handleDatabaseError(userResponse.error)
  }

  return getCurrentAccount(auth)
}

async function logoutCurrentSession(auth) {
  const response = await supabase
    .from("sessao_login")
    .delete()
    .eq("id_sessao_login", auth.session.id_sessao_login)
    .eq("id_login", auth.idLogin)
    .select("*")

  handleDatabaseError(response.error)
  return sanitizeSession(response.data?.[0] || null)
}

async function deleteCurrentAccount(auth) {
  const taskIdsResponse = await supabase
    .from("tarefas")
    .select("id_tarefa")
    .eq("id_login", auth.idLogin)

  handleDatabaseError(taskIdsResponse.error)

  const taskIds = (taskIdsResponse.data || []).map((task) => task.id_tarefa)

  if (taskIds.length > 0) {
    const taskTagDeleteResponse = await supabase
      .from("tarefa_etiqueta")
      .delete()
      .in("id_tarefa", taskIds)

    handleDatabaseError(taskTagDeleteResponse.error)
  }

  const cleanupSteps = [
    () => supabase.from("sessoes_foco").delete().eq("id_login", auth.idLogin),
    () => supabase.from("tarefas").delete().eq("id_login", auth.idLogin),
    () => supabase.from("login_time").delete().eq("id_login", auth.idLogin),
    () => supabase.from("integracoes").delete().eq("id_login", auth.idLogin),
    () => supabase.from("categorias").delete().eq("id_login", auth.idLogin),
    () => supabase.from("etiquetas").delete().eq("id_login", auth.idLogin),
    () => supabase.from("sessao_login").delete().eq("id_login", auth.idLogin),
    () => supabase.from("times").delete().eq("id_login", auth.idLogin),
    () => supabase.from("login").delete().eq("id_login", auth.idLogin)
  ]

  for (const runStep of cleanupSteps) {
    const response = await runStep()
    handleDatabaseError(response.error)
  }

  const otherLoginsResponse = await supabase
    .from("login")
    .select("id_login")
    .eq("id_usuario", auth.idUsuario)

  handleDatabaseError(otherLoginsResponse.error)

  if ((otherLoginsResponse.data || []).length === 0) {
    const userDeleteResponse = await supabase
      .from("usuario")
      .delete()
      .eq("id_usuario", auth.idUsuario)

    handleDatabaseError(userDeleteResponse.error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentAccount,
  updateCurrentAccount,
  logoutCurrentSession,
  deleteCurrentAccount
}
