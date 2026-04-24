const authService = require("../services/auth.service")

async function register(req, res) {
  try {
    const { email, password, fullName, avatarUrl } = req.body

    const data = await authService.registerUser({
      email,
      password,
      fullName,
      avatarUrl
    })

    return res.status(201).json({
      message: "Usuario criado com sucesso",
      login: data.login,
      user: data.user
    })
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    const data = await authService.loginUser({
      email,
      password
    })

    return res.status(200).json({
      message: "Login realizado com sucesso",
      login: data.login,
      user: data.user,
      session: data.session
    })
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      error: error.message
    })
  }
}

async function me(req, res) {
  try {
    const data = await authService.getCurrentAccount(req.auth)

    return res.status(200).json({
      data
    })
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    })
  }
}

async function updateMe(req, res) {
  try {
    const data = await authService.updateCurrentAccount(req.auth, req.body)

    return res.status(200).json({
      message: "Conta atualizada com sucesso",
      data
    })
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    })
  }
}

async function logout(req, res) {
  try {
    await authService.logoutCurrentSession(req.auth)

    return res.status(200).json({
      message: "Logout realizado com sucesso"
    })
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    })
  }
}

async function deleteMe(req, res) {
  try {
    await authService.deleteCurrentAccount(req.auth)

    return res.status(200).json({
      message: "Conta removida com sucesso"
    })
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    })
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe,
  logout,
  deleteMe
}
