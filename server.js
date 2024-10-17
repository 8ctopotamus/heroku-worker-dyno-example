require('dotenv').config()
const path = require('path')
const express = require('express')
const Queue = require('bull')

const PORT = process.env.PORT || 5000
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
console.log('Web REDIS_URL', REDIS_URL)

const app = express()
const workQueue = new Queue('work', REDIS_URL, { 
  redis: { tls: { rejectUnauthorized: false } }
})

workQueue.on('error', (err) => {
  console.log('Web queue err')
  console.log(err)
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
app.get('/client.js', (req, res) => res.sendFile(path.join(__dirname, 'client.js')))

// add job to the queue
app.post('/job', async (req, res) => {
  const job = await workQueue.add()
  res.json({ id: job.id })
})

// allow the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  const { id } = req.params
  const job = await workQueue.getJob(id)
  console.log(job)
  if (job === null) {
    res.status(404).end()
  } else {
    const state = await job.getState()
    const progress = job._progress
    const reason = job.failedReason
    res.json({ id, state, progress, reason })
  }
})

workQueue.on('global:completed', (jobId, result) => {
  console.log(`Job (${jobId}) completed with result ${result}`)
})

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))