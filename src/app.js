// Framework para criacao de servidores HTTP
const express = require("express")

// Controle de requisicoes externas
const cors = require("cors")

// Carrega variaveis de ambiente (.env)
require("dotenv").config()

// const pool = require("./config/db")

// Cria uma instacia do servidor express
const app = express()

app.use(cors())

// Permite que as requisicoes express podem vir com json
app.use(express.json())

// Rota para teste de funcionamento da API
app.get("/health", (req, res) => {
    res.json({ status: "ok",
        service: "API samTask"
    })
})

module.exports = app