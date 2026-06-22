import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import Papa from 'papaparse';

const app = express();
const PORT = 3000;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ79hHc73Ww0MB6Nb7-OAxCfuqH4I_KS3oAtHsNR-bhDhNRLGAcI5wyYalG7m_1TWeW44hMb6hTUC1o/pub?gid=1000295038&single=true&output=csv";

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get(SHEET_URL, { responseType: 'text' });
    const parsed = Papa.parse(response.data, { header: false });
    
    // Check if the first row contains HTML, which indicates it didn't return CSV (e.g., login page)
    if (response.data.trim().startsWith('<')) {
      throw new Error("HTML recebido, a planilha provavelmente está privada.");
    }

    res.json({ success: true, data: parsed.data });
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      res.status(401).json({ success: false, error: 'A planilha é privada. Por favor, altere o acesso para "Qualquer pessoa com o link" ou habilite as credenciais.' });
    } else {
      console.error("Error fetching sheet data:", error.message);
      res.status(500).json({ success: false, error: 'Falha ao buscar os dados da planilha. ' + error.message });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
