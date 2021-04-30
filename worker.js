const throng = require('throng')
const Queue = require('bull')

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const workers = process.env.WEB_CONCURRENCY || 2

const maxJobsPerWorker = 50

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function start() {
  console.log('Work Queue starting...')
  const workQueue = new Queue('work', REDIS_URL)
  
  workQueue.process(maxJobsPerWorker, async job => {
    console.log('Running Job...')
    console.log(job)
    let progress = 0
    if (Math.random() < 0.05) {
      throw new Error('Job failed!')
    }
    while(progress < 100) {
      await sleep(50)
      progress += 1
      job.progress(progress)
    }
    return { value: 'This will be stored' }
  })
}

throng({ workers, start })