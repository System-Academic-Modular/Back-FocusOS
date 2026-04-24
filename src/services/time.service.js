const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { getMissingRequiredFields, hasFields, pickDefinedFields } = require("../utils/payload")
const { generatePublicKey } = require("../utils/security")
const { applyOwnerScope, getOwnedRecordByPublicKey } = require("../utils/reference")

const publicSelect = "key_time, data_criacao, data_atualizacao, nome, descricao, codigo_convite"

async function list(auth) {
  let query = supabase.from("times").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_time", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return response.data || []
}

async function getByKey(keyTime, auth) {
  return getOwnedRecordByPublicKey({
    table: "times",
    keyField: "key_time",
    publicKey: keyTime,
    auth,
    select: publicSelect,
    notFoundMessage: "Time nao encontrado"
  })
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, ["nome", "descricao", "codigo_convite"])
  const missingFields = getMissingRequiredFields(record, ["nome"])

  if (missingFields.length > 0) {
    throw createAppError(400, `Campos obrigatorios nao informados: ${missingFields.join(", ")}`)
  }

  const response = await supabase
    .from("times")
    .insert({
      ...record,
      key_time: generatePublicKey("time"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return response.data
}

async function update(keyTime, payload, auth) {
  await getByKey(keyTime, auth)

  const updates = pickDefinedFields(payload, ["nome", "descricao", "codigo_convite"])

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase.from("times").update(updates).select(publicSelect).eq("key_time", keyTime)
  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return response.data
}

async function remove(keyTime, auth) {
  await getByKey(keyTime, auth)

  let query = supabase.from("times").delete().select(publicSelect).eq("key_time", keyTime)
  query = applyOwnerScope(query, auth)

  const response = await query
  handleDatabaseError(response.error)
  return response.data?.[0] || null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
