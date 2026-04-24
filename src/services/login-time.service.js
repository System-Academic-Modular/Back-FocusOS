const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { hasFields, pickDefinedFields } = require("../utils/payload")
const {
  applyOwnerScope,
  getOwnedRecordByPublicKey,
  resolveOwnedIdByPublicKey
} = require("../utils/reference")

const publicSelect = "super_admin, data_integracao, times(key_time)"

function serializeLoginTime(record) {
  return {
    key_time: record.times?.key_time || null,
    super_admin: record.super_admin,
    data_integracao: record.data_integracao
  }
}

async function getRelationRecordByKey(keyTime, auth) {
  const time = await getOwnedRecordByPublicKey({
    table: "times",
    keyField: "key_time",
    publicKey: keyTime,
    auth,
    select: "id_time",
    notFoundMessage: "Time nao encontrado"
  })

  let query = supabase.from("login_time").select(publicSelect).eq("id_time", time.id_time)
  query = applyOwnerScope(query, auth)

  const response = await query.maybeSingle()
  handleDatabaseError(response.error)

  if (!response.data) {
    throw createAppError(404, "Vinculo login_time nao encontrado")
  }

  return response.data
}

async function list(auth) {
  let query = supabase.from("login_time").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_time", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return (response.data || []).map(serializeLoginTime)
}

async function getByKey(keyTime, auth) {
  const record = await getRelationRecordByKey(keyTime, auth)
  return serializeLoginTime(record)
}

async function create(payload, auth) {
  const { key_time: keyTime, super_admin: superAdmin } = payload

  if (!keyTime) {
    throw createAppError(400, "key_time e obrigatorio")
  }

  const idTime = await resolveOwnedIdByPublicKey({
    table: "times",
    keyField: "key_time",
    idField: "id_time",
    publicKey: keyTime,
    auth,
    notFoundMessage: "Time nao encontrado"
  })

  const response = await supabase
    .from("login_time")
    .insert({
      id_time: idTime,
      id_login: auth.idLogin,
      super_admin: superAdmin ?? false
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return serializeLoginTime(response.data)
}

async function update(currentKeyTime, payload, auth) {
  await getRelationRecordByKey(currentKeyTime, auth)

  const updates = pickDefinedFields(payload, ["super_admin"])

  if (payload.key_time !== undefined) {
    updates.id_time = await resolveOwnedIdByPublicKey({
      table: "times",
      keyField: "key_time",
      idField: "id_time",
      publicKey: payload.key_time,
      auth,
      notFoundMessage: "Time nao encontrado"
    })
  }

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  const currentTime = await getOwnedRecordByPublicKey({
    table: "times",
    keyField: "key_time",
    publicKey: currentKeyTime,
    auth,
    select: "id_time",
    notFoundMessage: "Time nao encontrado"
  })

  let query = supabase
    .from("login_time")
    .update(updates)
    .select(publicSelect)
    .eq("id_time", currentTime.id_time)

  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return serializeLoginTime(response.data)
}

async function remove(keyTime, auth) {
  await getRelationRecordByKey(keyTime, auth)

  const time = await getOwnedRecordByPublicKey({
    table: "times",
    keyField: "key_time",
    publicKey: keyTime,
    auth,
    select: "id_time",
    notFoundMessage: "Time nao encontrado"
  })

  let query = supabase.from("login_time").delete().select(publicSelect).eq("id_time", time.id_time)
  query = applyOwnerScope(query, auth)

  const response = await query
  handleDatabaseError(response.error)
  return response.data?.[0] ? serializeLoginTime(response.data[0]) : null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
