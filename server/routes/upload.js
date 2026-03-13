const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
const { parseDoc } = require('../services/parser')
const { getSiteId, uploadAsset, createCMSItem } = require('../services/webflow')
const { saveUpload, getUploads } = require('../services/db')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', upload.fields([{ name: 'doc', maxCount: 1 }, { name: 'images' }]), async (req, res) => {
  try {
    const docFile = req.files?.doc?.[0]
    const imageFiles = req.files?.images || []

    if (!docFile) return res.status(400).json({ error: 'No document provided' })

    // Parse the .docx
    const { metaTitle, introduction, description } = await parseDoc(docFile.buffer)

    // Get site ID for asset uploads
    const siteId = await getSiteId()

    // Categorize images by filename convention
    let singleImageFile = null
    const multiImageFiles = []

    for (const img of imageFiles) {
      const nameWithoutExt = img.originalname.replace(/\.[^.]+$/, '').toLowerCase()
      if (nameWithoutExt === 'image') {
        singleImageFile = img
      } else if (/^m-\d+$/.test(nameWithoutExt)) {
        multiImageFiles.push(img)
      }
    }

    // Sort multi-images by their number (m-1, m-2, m-3...)
    multiImageFiles.sort((a, b) => {
      const numA = parseInt(a.originalname.match(/m-(\d+)/)?.[1] || 0)
      const numB = parseInt(b.originalname.match(/m-(\d+)/)?.[1] || 0)
      return numA - numB
    })

    // Upload assets to Webflow
    let singleImage = null
    if (singleImageFile) {
      singleImage = await uploadAsset(siteId, singleImageFile.originalname, singleImageFile.buffer)
    }

    const multiImages = []
    for (const img of multiImageFiles) {
      const uploaded = await uploadAsset(siteId, img.originalname, img.buffer)
      multiImages.push(uploaded)
    }

    // Create & publish the CMS item
    const item = await createCMSItem({ metaTitle, introduction, description, singleImage, multiImages })

    // Save to local DB for history
    const record = await saveUpload({
      id: crypto.randomUUID(),
      title: metaTitle || docFile.originalname.replace(/\.[^.]+$/, ''),
      imageCount: imageFiles.length,
      webflowItemId: item.id,
    })

    res.json({ success: true, upload: record })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/history', async (req, res) => {
  try {
    res.json(await getUploads())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
