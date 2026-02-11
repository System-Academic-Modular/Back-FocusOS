require("dotenv").config()

// Importa o arquivo app responsavel pelo gerenciamento das rotas
const app = require("./app")

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`)
})