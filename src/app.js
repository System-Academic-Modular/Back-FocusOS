// Framework para criacao de servidores HTTP
const express = require("express")

// Controle de requisicoes externas
const cors = require("cors")

// Carrega variaveis de ambiente (.env)
require("dotenv").config()

// Importacao dos arquivos de rotas
const authRoutes = require("./routes/auth.route")

// Cria uma instacia do servidor express
const app = express()

// Configuração do CORS para permitir que seu front-end acesse a API
app.use(cors())

// Permite que as requisicoes express podem vir com json
app.use(express.json())

// NOVO: Rota Raiz para evitar o erro "Cannot GET /" no domínio principal
app.get("/", (req, res) => {
    res.json({ 
        message: "Focus OS API - Online", 
        status: "ok",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: "/auth"
        }
    })
})

// Rota para teste de funcionamento da API
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok",
        service: "API samTask",
        timestamp: new Date().toISOString()
    })
})

// Rotas do sistema
app.use("/auth", authRoutes)

// Exporta o app para que a Vercel/Serverless consiga utilizá-lo
module.exports = app