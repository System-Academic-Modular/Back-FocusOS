const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { hasFields } = require("../utils/payload")
const {
  getOwnedRecordByPublicKey,
  resolveOwnedIdByPublicKey
} = require("../utils/reference")

const publicSelect = "tarefas(key_tarefa), etiquetas(key_etiqueta)"

function serializeTaskTag(record) {
  return {
    key_tarefa: record.tarefas?.key_tarefa || null,
    key_etiqueta: record.etiquetas?.key_etiqueta || null
  }
}

async function getTaskId(keyTarefa, auth) {
  return resolveOwnedIdByPublicKey({
    table: "tarefas",
    keyField: "key_tarefa",
    idField: "id_tarefa",
    publicKey: keyTarefa,
    auth,
    notFoundMessage: "Tarefa nao encontrada"
  })
}

async function getTagId(keyEtiqueta, auth) {
  return resolveOwnedIdByPublicKey({
    table: "etiquetas",
    keyField: "key_etiqueta",
    idField: "id_etiqueta",
    publicKey: keyEtiqueta,
    auth,
    notFoundMessage: "Etiqueta nao encontrada"
  })
}

async function getRelationRecord(keyTarefa, keyEtiqueta, auth) {
  const idTarefa = await getTaskId(keyTarefa, auth)
  const idEtiqueta = await getTagId(keyEtiqueta, auth)

  const response = await supabase
    .from("tarefa_etiqueta")
    .select(publicSelect)
    .eq("id_tarefa", idTarefa)
    .eq("id_etiqueta", idEtiqueta)
    .maybeSingle()

  handleDatabaseError(response.error)

  if (!response.data) {
    throw createAppError(404, "Relacionamento tarefa_etiqueta nao encontrado")
  }

  return response.data
}

async function list(auth) {
  const tasksResponse = await supabase.from("tarefas").select("id_tarefa").eq("id_login", auth.idLogin)
  handleDatabaseError(tasksResponse.error)

  const taskIds = (tasksResponse.data || []).map((task) => task.id_tarefa)

  if (taskIds.length === 0) {
    return []
  }

  const response = await supabase
    .from("tarefa_etiqueta")
    .select(publicSelect)
    .in("id_tarefa", taskIds)
    .order("id_tarefa", { ascending: true })
    .order("id_etiqueta", { ascending: true })

  handleDatabaseError(response.error)
  return (response.data || []).map(serializeTaskTag)
}

async function getByKey(keyTarefa, keyEtiqueta, auth) {
  const record = await getRelationRecord(keyTarefa, keyEtiqueta, auth)
  return serializeTaskTag(record)
}

async function create(payload, auth) {
  if (!payload.key_tarefa || !payload.key_etiqueta) {
    throw createAppError(400, "key_tarefa e key_etiqueta sao obrigatorios")
  }

  const response = await supabase
    .from("tarefa_etiqueta")
    .insert({
      id_tarefa: await getTaskId(payload.key_tarefa, auth),
      id_etiqueta: await getTagId(payload.key_etiqueta, auth)
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return serializeTaskTag(response.data)
}

async function update(currentKeyTarefa, currentKeyEtiqueta, payload, auth) {
  await getRelationRecord(currentKeyTarefa, currentKeyEtiqueta, auth)

  const updates = {}

  if (payload.key_tarefa !== undefined) {
    updates.id_tarefa = await getTaskId(payload.key_tarefa, auth)
  }

  if (payload.key_etiqueta !== undefined) {
    updates.id_etiqueta = await getTagId(payload.key_etiqueta, auth)
  }

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  const currentTask = await getOwnedRecordByPublicKey({
    table: "tarefas",
    keyField: "key_tarefa",
    publicKey: currentKeyTarefa,
    auth,
    select: "id_tarefa",
    notFoundMessage: "Tarefa nao encontrada"
  })

  const currentTag = await getOwnedRecordByPublicKey({
    table: "etiquetas",
    keyField: "key_etiqueta",
    publicKey: currentKeyEtiqueta,
    auth,
    select: "id_etiqueta",
    notFoundMessage: "Etiqueta nao encontrada"
  })

  const response = await supabase
    .from("tarefa_etiqueta")
    .update(updates)
    .eq("id_tarefa", currentTask.id_tarefa)
    .eq("id_etiqueta", currentTag.id_etiqueta)
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return serializeTaskTag(response.data)
}

async function remove(keyTarefa, keyEtiqueta, auth) {
  await getRelationRecord(keyTarefa, keyEtiqueta, auth)

  const idTarefa = await getTaskId(keyTarefa, auth)
  const idEtiqueta = await getTagId(keyEtiqueta, auth)

  const response = await supabase
    .from("tarefa_etiqueta")
    .delete()
    .eq("id_tarefa", idTarefa)
    .eq("id_etiqueta", idEtiqueta)
    .select(publicSelect)

  handleDatabaseError(response.error)
  return response.data?.[0] ? serializeTaskTag(response.data[0]) : null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
