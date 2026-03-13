const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function saveUpload({ id, title, imageCount, webflowItemId }) {
  const { data, error } = await supabase
    .from('uploads')
    .insert({ id, title, image_count: imageCount, webflow_item_id: webflowItemId })
    .select()
    .single()

  if (error) throw new Error(`DB insert failed: ${error.message}`)
  return {
    id: data.id,
    title: data.title,
    imageCount: data.image_count,
    webflowItemId: data.webflow_item_id,
    uploadedAt: data.uploaded_at,
  }
}

async function getUploads() {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(`DB fetch failed: ${error.message}`)
  return data.map(d => ({
    id: d.id,
    title: d.title,
    imageCount: d.image_count,
    webflowItemId: d.webflow_item_id,
    uploadedAt: d.uploaded_at,
  }))
}

module.exports = { saveUpload, getUploads }
