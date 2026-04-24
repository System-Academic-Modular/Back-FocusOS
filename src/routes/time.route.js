const express = require("express")

const timeController = require("../controllers/time.controller")

const router = express.Router()

router.get("/", timeController.list)
router.post("/", timeController.create)
router.get("/:key_time", timeController.getByKey)
router.put("/:key_time", timeController.update)
router.delete("/:key_time", timeController.remove)

module.exports = router
