const express = require("express")
const cors = require("cors")

require("dotenv").config()

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
