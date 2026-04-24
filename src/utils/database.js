const { createAppError } = require("./app-error")

function handleDatabaseError(error, fallbackMessage = "Erro ao acessar o banco") {
  if (!error) {
    return
  }

  if (error.code === "23505") {
    throw createAppError(409, error.message || "Registro ja existe")
  }

  if (error.code === "23503") {
    throw createAppError(400, error.message || "Registro relacionado nao encontrado")
  }

  if (error.code === "PGRST116") {
    throw createAppError(404, "Registro nao encontrado")
  }

  throw createAppError(400, error.message || fallbackMessage)
}

module.exports = {
  handleDatabaseError
}
