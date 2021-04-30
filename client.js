const jobs = {}

async function addJob() {
  const res = await fetch('/job', { method: 'POST' })
  const job = await res.json()
  jobs[job.id] = { id: job.id, state: 'queued' }
  render()
}

async function updateJobs() {
  for (let id of Object.keys(jobs)) {
    const res = await fetch(`/job/${id}`)
    const result = await res.json()
    if (!!jobs[id]) {
      jobs[id] = result
    }
    render()
  }
}

function clear() {
  jobs = {}
  render()
}

function render() {
  let s = ''
  for (let id of Object.keys(jobs)) {
    s += renderJob(jobs[id])
  }
  document.querySelector('#job-summary').innerHTML = s
}

function renderJob(job) {
  console.log(job)
  let progress = job.progress || 0
  let color = 'bg-light-purple'
  if (job.state === 'completed') {
    color = 'bg-purple'
    progress = 100
  } else if (job.state === 'failed') {
    color = 'bg-dark-red'
    progress = 100
  }
  return document.querySelector('#job-template')
    .innerHTML
    .replace('{{id}}', job.id)
    .replace('{{state}}', job.state)
    .replace('{{color}}', color)
    .replace('{{progress}}', progress)
}

window.onload = function() {
  document.querySelector('#add-job').addEventListener('click', addJob)
  document.querySelector('#clear').addEventListener('click', clear)
  setInterval(updateJobs, 200)
}