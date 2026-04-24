const express = require("express")

const tarefaController = require("../controllers/tarefa.controller")

const router = express.Router()

router.get("/", tarefaController.list)
router.post("/", tarefaController.create)
router.get("/:key_tarefa", tarefaController.getByKey)
router.put("/:key_tarefa", tarefaController.update)
router.delete("/:key_tarefa", tarefaController.remove)

module.exports = router
