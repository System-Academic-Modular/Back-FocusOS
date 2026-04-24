const express = require("express")

const tarefaEtiquetaController = require("../controllers/tarefa-etiqueta.controller")

const router = express.Router()

router.get("/", tarefaEtiquetaController.list)
router.post("/", tarefaEtiquetaController.create)
router.get("/:key_tarefa/:key_etiqueta", tarefaEtiquetaController.getByKey)
router.put("/:key_tarefa/:key_etiqueta", tarefaEtiquetaController.update)
router.delete("/:key_tarefa/:key_etiqueta", tarefaEtiquetaController.remove)

module.exports = router
