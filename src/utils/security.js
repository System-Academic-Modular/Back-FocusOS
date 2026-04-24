const crypto = require("crypto")

function generatePublicKey(prefix = "key") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`
}

function generateSessionToken() {
  return crypto.randomBytes(48).toString("hex")
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")

  return `scrypt:${salt}:${hash}`
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false
  }

  const [algorithm, salt, storedHash] = storedPassword.split(":")

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false
  }

  const derivedHash = crypto.scryptSync(password, salt, 64)
  const expectedHash = Buffer.from(storedHash, "hex")

  if (derivedHash.length !== expectedHash.length) {
    return false
  }

  return crypto.timingSafeEqual(derivedHash, expectedHash)
}

function sanitizeLogin(login) {
  if (!login) {
    return null
  }

  const { id_login, id_usuario, senha, ...safeLogin } = login
  return safeLogin
}

function sanitizeUser(user) {
  if (!user) {
    return null
  }

  const { id_usuario, ...safeUser } = user
  return safeUser
}

function sanitizeSession(session) {
  if (!session) {
    return null
  }

  const { id_sessao_login, id_login, ...safeSession } = session
  return safeSession
}

module.exports = {
  generatePublicKey,
  generateSessionToken,
  hashPassword,
  verifyPassword,
  sanitizeLogin,
  sanitizeUser,
  sanitizeSession
}
