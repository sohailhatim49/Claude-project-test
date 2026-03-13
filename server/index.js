require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const uploadRouter = require('./routes/upload')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', uploadRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
