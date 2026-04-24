const express = require("express")
const cors = require("cors")

require("dotenv").config()

const { supabase } = require("./config/supabase")
const authMiddleware = require("./middlewares/auth.middleware")
const authRoutes = require("./routes/auth.route")
const categoriaRoutes = require("./routes/categoria.route")
const etiquetaRoutes = require("./routes/etiqueta.route")
const integracaoRoutes = require("./routes/integracao.route")
const loginTimeRoutes = require("./routes/login-time.route")
const sessaoFocoRoutes = require("./routes/sessao-foco.route")
const tarefaEtiquetaRoutes = require("./routes/tarefa-etiqueta.route")
const tarefaRoutes = require("./routes/tarefa.route")
const timeRoutes = require("./routes/time.route")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "API samTask"
  })
})

app.get("/db-test", async (req, res) => {
  try {
    const response = await supabase.from("usuario").select("key_usuario").limit(1)

    if (response.error) {
      return res.status(500).json({
        status: "error",
        message: "Falha ao conectar no banco",
        error: response.error.message
      })
    }

    return res.status(200).json({
      status: "ok",
      message: "Conexao com o banco realizada com sucesso"
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Erro inesperado ao testar conexao com o banco",
      error: error.message
    })
  }
})

app.use("/auth", authRoutes)
app.use("/categorias", authMiddleware, categoriaRoutes)
app.use("/etiquetas", authMiddleware, etiquetaRoutes)
app.use("/integracoes", authMiddleware, integracaoRoutes)
app.use("/login-time", authMiddleware, loginTimeRoutes)
app.use("/sessoes-foco", authMiddleware, sessaoFocoRoutes)
app.use("/tarefa-etiqueta", authMiddleware, tarefaEtiquetaRoutes)
app.use("/tarefas", authMiddleware, tarefaRoutes)
app.use("/times", authMiddleware, timeRoutes)

module.exports = app
