const express = require('express')
const app = express()
const port = 3000

// Middleware để parse JSON
app.use(express.json())

// Route đơn giản
app.get('/', (req, res) => {
  res.send('Hello Express 🚀')
})

// Ví dụ API
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Express API' })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
