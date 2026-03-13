const crypto = require('crypto')

const BASE = 'https://api.webflow.com/v2'

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
    accept: 'application/json',
    'content-type': 'application/json',
  }
}

function getSiteId() {
  return process.env.WEBFLOW_SITE_ID
}

async function uploadAsset(siteId, fileName, fileBuffer) {
  const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex')

  // Step 1: Initiate upload with Webflow
  const initRes = await fetch(`${BASE}/sites/${siteId}/assets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fileName, fileHash }),
  })
  if (!initRes.ok) {
    const err = await initRes.text()
    throw new Error(`Asset upload init failed: ${err}`)
  }
  const { id, hostedUrl, uploadUrl, uploadDetails } = await initRes.json()

  // Step 2: Upload file to S3 using the signed URL
  const form = new FormData()
  for (const [key, value] of Object.entries(uploadDetails)) {
    form.append(key, value)
  }
  const blob = new Blob([fileBuffer], { type: uploadDetails['content-type'] || 'application/octet-stream' })
  form.append('file', blob, fileName)

  const s3Res = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
  })
  if (s3Res.status !== 201 && !s3Res.ok) {
    throw new Error(`S3 upload failed: ${s3Res.status}`)
  }

  return { id, url: hostedUrl }
}

async function createCMSItem({ metaTitle, introduction, description, singleImage, multiImages }) {
  const collectionId = process.env.WEBFLOW_COLLECTION_ID

  const fieldData = {
    name: metaTitle,
    introduction,
    description,
  }

  if (singleImage) {
    fieldData['image-1'] = { fileId: singleImage.id, url: singleImage.url, alt: '' }
  }

  if (multiImages && multiImages.length > 0) {
    fieldData['multi-images'] = multiImages.map(img => ({
      fileId: img.id,
      url: img.url,
      alt: '',
    }))
  }

  const res = await fetch(`${BASE}/collections/${collectionId}/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ isArchived: false, isDraft: false, fieldData }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CMS item creation failed: ${err}`)
  }
  const item = await res.json()

  // Publish the item
  await fetch(`${BASE}/collections/${collectionId}/items/publish`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ itemIds: [item.id] }),
  })

  return item
}

module.exports = { getSiteId, uploadAsset, createCMSItem }
