const express = require("express")

const loginTimeController = require("../controllers/login-time.controller")

const router = express.Router()

router.get("/", loginTimeController.list)
router.post("/", loginTimeController.create)
router.get("/:key_time", loginTimeController.getByKey)
router.put("/:key_time", loginTimeController.update)
router.delete("/:key_time", loginTimeController.remove)

module.exports = router
