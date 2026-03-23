require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { pool, initDb } = require('./db')

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors({ origin: '*' }))
app.use(express.json())

async function insertHistory(client, { stepId, action, oldData, newData, changedBy }) {
  await client.query(
    `
      INSERT INTO process_step_history(step_id, action, old_data, new_data, changed_by)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [stepId, action, oldData || null, newData || null, changedBy || 'system']
  )
}

function getChangedBy(req) {
  return req.header('x-user') || 'anonymous'
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database not reachable' })
  }
})

app.get('/steps', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, description, step_order, previous_step_id, created_at, updated_at
        FROM process_steps
        ORDER BY step_order ASC
      `
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching steps' })
  }
})

app.get('/steps/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, description, step_order, previous_step_id, created_at, updated_at
        FROM process_steps
        WHERE id = $1
      `,
      [req.params.id]
    )

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Step not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching step' })
  }
})

app.post('/steps', async (req, res) => {
  const { name, description, step_order: stepOrder, previous_step_id: previousStepId } = req.body

  if (!name || typeof stepOrder !== 'number') {
    return res.status(400).json({ message: 'name and step_order are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (previousStepId) {
      const prev = await client.query('SELECT id FROM process_steps WHERE id = $1', [previousStepId])
      if (!prev.rows.length) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'previous_step_id does not exist' })
      }
    }

    const result = await client.query(
      `
        INSERT INTO process_steps(name, description, step_order, previous_step_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, step_order, previous_step_id, created_at, updated_at
      `,
      [name, description || null, stepOrder, previousStepId || null]
    )

    const created = result.rows[0]

    await insertHistory(client, {
      stepId: created.id,
      action: 'CREATE',
      oldData: null,
      newData: created,
      changedBy: getChangedBy(req)
    })

    await client.query('COMMIT')
    return res.status(201).json(created)
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') {
      return res.status(409).json({ message: 'step_order must be unique' })
    }
    return res.status(500).json({ message: 'Error creating step' })
  } finally {
    client.release()
  }
})

app.put('/steps/:id', async (req, res) => {
  const { name, description, step_order: stepOrder, previous_step_id: previousStepId } = req.body

  if (!name || typeof stepOrder !== 'number') {
    return res.status(400).json({ message: 'name and step_order are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const existingResult = await client.query(
      `
        SELECT id, name, description, step_order, previous_step_id, created_at, updated_at
        FROM process_steps
        WHERE id = $1
      `,
      [req.params.id]
    )

    if (!existingResult.rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Step not found' })
    }

    if (previousStepId) {
      if (Number(previousStepId) === Number(req.params.id)) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'A step cannot reference itself as previous_step_id' })
      }

      const prev = await client.query('SELECT id FROM process_steps WHERE id = $1', [previousStepId])
      if (!prev.rows.length) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'previous_step_id does not exist' })
      }
    }

    const oldData = existingResult.rows[0]

    const updateResult = await client.query(
      `
        UPDATE process_steps
        SET name = $1,
            description = $2,
            step_order = $3,
            previous_step_id = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, description, step_order, previous_step_id, created_at, updated_at
      `,
      [name, description || null, stepOrder, previousStepId || null, req.params.id]
    )

    const updated = updateResult.rows[0]

    await insertHistory(client, {
      stepId: updated.id,
      action: 'UPDATE',
      oldData,
      newData: updated,
      changedBy: getChangedBy(req)
    })

    await client.query('COMMIT')
    return res.json(updated)
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') {
      return res.status(409).json({ message: 'step_order must be unique' })
    }
    return res.status(500).json({ message: 'Error updating step' })
  } finally {
    client.release()
  }
})

app.delete('/steps/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const existingResult = await client.query(
      `
        SELECT id, name, description, step_order, previous_step_id, created_at, updated_at
        FROM process_steps
        WHERE id = $1
      `,
      [req.params.id]
    )

    if (!existingResult.rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Step not found' })
    }

    const oldData = existingResult.rows[0]

    await client.query('DELETE FROM process_steps WHERE id = $1', [req.params.id])

    await insertHistory(client, {
      stepId: oldData.id,
      action: 'DELETE',
      oldData,
      newData: null,
      changedBy: getChangedBy(req)
    })

    await client.query('COMMIT')
    return res.status(204).send()
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({ message: 'Error deleting step' })
  } finally {
    client.release()
  }
})

app.get('/steps/:id/history', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, step_id, action, old_data, new_data, changed_by, changed_at
        FROM process_step_history
        WHERE step_id = $1
        ORDER BY changed_at DESC
      `,
      [req.params.id]
    )
    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching step history' })
  }
})

app.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, step_id, action, old_data, new_data, changed_by, changed_at
        FROM process_step_history
        ORDER BY changed_at DESC
      `
    )
    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching history' })
  }
})

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Microservice listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message)
    process.exit(1)
  })
