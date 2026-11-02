import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const BRIDGE_PATH = path.join(__dirname, 'excel_bridge.py');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let bridgeQueue = Promise.resolve();

function executeBridge(args, payload = null) {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const proc = spawn(pythonCmd, [BRIDGE_PATH, ...args], {
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(new Error(stderr || `Bridge exited with code ${code}`));
      }
      try {
        const json = JSON.parse(stdout.trim());
        resolve(json);
      } catch (err) {
        reject(new Error(`Failed to parse bridge output: ${stdout || stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    if (payload !== null) {
      proc.stdin.write(JSON.stringify(payload));
      proc.stdin.end();
    }
  });
}

function runBridge(args, payload = null) {
  const task = () => executeBridge(args, payload);
  const next = bridgeQueue.then(task, task);
  bridgeQueue = next.catch(() => {});
  return next;
}

// ── Endpoints ───────────────────────────────────────────────

app.get('/api/status', async (req, res) => {
  try {
    const result = await runBridge(['status']);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const result = await runBridge(['read_all']);
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.get('/api/dropdowns', async (req, res) => {
  try {
    const result = await runBridge(['read_dropdowns']);
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json({ success: true, data: result.dropdowns || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const result = await runBridge(['seed_demo', '-'], req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.get('/api/:entity', async (req, res) => {
  const entity = req.params.entity.toLowerCase();
  try {
    const result = await runBridge(['read_all']);
    if (!result.success) {
      return res.status(500).json(result);
    }
    const items = result.data[entity] || [];
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.post('/api/:entity', async (req, res) => {
  const entity = req.params.entity.toLowerCase();
  try {
    const result = await runBridge(['add_row', entity, '-'], req.body);
    if (!result.success) {
      const status = result.error === 'FILE_LOCKED' ? 423 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.put('/api/:entity/:id', async (req, res) => {
  const entity = req.params.entity.toLowerCase();
  const id = req.params.id;
  try {
    const result = await runBridge(['update_row', entity, id, '-'], req.body);
    if (!result.success) {
      const status = result.error === 'FILE_LOCKED' ? 423 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.delete('/api/:entity/:id', async (req, res) => {
  const entity = req.params.entity.toLowerCase();
  const id = req.params.id;
  try {
    const result = await runBridge(['delete_row', entity, id]);
    if (!result.success) {
      const status = result.error === 'FILE_LOCKED' ? 423 : 400;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DOP Workspace Excel Server running on http://localhost:${PORT}`);
});
