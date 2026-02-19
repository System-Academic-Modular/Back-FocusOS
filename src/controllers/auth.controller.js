const authService = require('../services/auth.service')

async function register(req, res) {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios"
      })
    }

    const user = await authService.registerUser({
      email,
      password,
      fullName
    })

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user
    })

  } catch (error) {
    return res.status(400).json({
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
      user: data.user,
      session: data.session
    })

  } catch (error) {
    return res.status(401).json({
      error: error.message
    })
  }
}

module.exports = {
  register,
  login
}
