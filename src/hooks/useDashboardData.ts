import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types';
import { initAuth, getAccessToken, googleSignIn, logout } from '../lib/auth';
import { User } from 'firebase/auth';

// Realistic mock data
const MOCK_DATA: DashboardData = {
  inscritos: 1250,
  entradasGrupo: 850,
  pesquisas: 425,
  icps: 180,
  diagnosticos: 45,

  taxaInscritosGrupo: 0.68, // 68%
  taxaGrupoPesquisa: 0.50, // 50%
  taxaPesquisaIcp: 0.42, // 42%

  investimentoTrafego: 15400,
  leadsMeta: 2000,
  cplMeta: 8.50,
  cplReal: 12.32,
};

const normalize = (s: string) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return NaN;
  let str = String(val).replace(/R\$/gi, '').replace(/%/g, '').trim();
  const normalizedMatch = str.match(/-?[\d.,]+/);
  if (!normalizedMatch) return NaN;
  
  let numStr = normalizedMatch[0];
  if (numStr.includes(',') && numStr.includes('.')) {
      if (numStr.lastIndexOf(',') < numStr.lastIndexOf('.')) {
          numStr = numStr.replace(/,/g, '');
      } else {
          numStr = numStr.replace(/\./g, '').replace(',', '.');
      }
  } else if (numStr.includes(',')) {
      numStr = numStr.replace(',', '.');
  }
  return parseFloat(numStr);
}

function extractValue(grid: any[][], searchTerms: string[], isPercentage = false): number | null {
  for (let r = 0; r < grid.length; r++) {
    if (!grid[r]) continue;
    for (let c = 0; c < grid[r].length; c++) {
      const cell = String(grid[r][c] || "");
      const normalizedCell = normalize(cell);
      
      const isMatch = searchTerms.some(term => {
        const normTerm = normalize(term);
        return normalizedCell === normTerm || (normalizedCell.includes(normTerm) && normalizedCell.length <= normTerm.length + 20);
      });

      if (isMatch) {
         if (c + 1 < grid[r].length && grid[r][c+1]) {
            const val = parseNumber(grid[r][c+1]);
            if (!isNaN(val)) return isPercentage && String(grid[r][c+1]).includes('%') ? val / 100 : val;
         }
         if (r + 1 < grid.length && grid[r+1] && grid[r+1][c]) {
            const val = parseNumber(grid[r+1][c]);
            if (!isNaN(val)) return isPercentage && String(grid[r+1][c]).includes('%') ? val / 100 : val;
         }
      }
    }
  }
  return null;
}

function extractDashboardValues(grid: any[][]): DashboardData {
  const inscritos = extractValue(grid, ['inscritos (planilha)', 'total de inscritos', 'inscritos']) ?? MOCK_DATA.inscritos;
  const entradasGrupo = extractValue(grid, ['entrada (grupo)', 'total de entradas no grupo', 'entradas no grupo', 'entrada no grupo', 'grupo']) ?? MOCK_DATA.entradasGrupo;
  const pesquisas = extractValue(grid, ['pesquisa (planilha)', 'total de pesquisas', 'pesquisas', 'pesquisa']) ?? MOCK_DATA.pesquisas;
  const icps = extractValue(grid, ['icps', 'total de icps']) ?? MOCK_DATA.icps;
  const diagnosticos = extractValue(grid, ['diagnostico (planilha)', 'total de diagnosticos', 'diagnosticos', 'diagnostico']) ?? MOCK_DATA.diagnosticos;

  const taxaInscritosGrupo = extractValue(grid, ['inscrito % grupo', 'inscritos % grupo', 'conversao grupo'], true) ?? (entradasGrupo / (inscritos || 1));
  const taxaGrupoPesquisa = extractValue(grid, ['grupo % pesquisa', 'inscrito % pesquisa', 'conversao pesquisa'], true) ?? (pesquisas / (entradasGrupo || 1));
  const taxaPesquisaIcp = extractValue(grid, ['pesquisa % icps', 'conversao icp'], true) ?? (icps / (pesquisas || 1));

  const investimentoTrafego = extractValue(grid, ['valor de instimento', 'valor de investimento', 'investimento total em trafego', 'investimento', 'trafego']) ?? MOCK_DATA.investimentoTrafego;
  const leadsMeta = extractValue(grid, ['leads (meta)', 'total de leads (meta)', 'leads meta', 'leads']) ?? MOCK_DATA.leadsMeta;
  const cplMeta = extractValue(grid, ['cpl (meta)', 'custo por lead (meta)', 'cpl meta']) ?? MOCK_DATA.cplMeta;
  const cplReal = extractValue(grid, ['cpl', 'custo por lead']) ?? MOCK_DATA.cplReal;

  return {
    inscritos, entradasGrupo, pesquisas, icps, diagnosticos,
    taxaInscritosGrupo, taxaGrupoPesquisa, taxaPesquisaIcp,
    investimentoTrafego, leadsMeta, cplMeta, cplReal
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Try public proxy first (works if spreadsheet is 'Anyone with link')
      try {
        const publicRes = await fetch('/api/data');
        if (publicRes.ok) {
          const rawResponse = await publicRes.json();
          if (rawResponse.success && rawResponse.data && Array.isArray(rawResponse.data)) {
            const grid = rawResponse.data;
            const values = extractDashboardValues(grid);
            setData(values);
            setError(null);
            setNeedsAuth(false);
            setLoading(false);
            return;
          }
        }
      } catch(e) {
        // Ignore and fallback to auth
      }

      // 2. Fallback to authenticated fetch if public proxy failed
      const token = await getAccessToken();
      
      if (!token) {
        setNeedsAuth(true);
        setData(MOCK_DATA);
        setError("A planilha do Google é privada. Conecte sua conta do Google para visualizar os dados de forma segura, ou torne a planilha pública.");
        setLoading(false);
        return;
      }

      setNeedsAuth(false);
      
      const SPREADSHEET_ID = "1QkFMFOCMMAzj3BgEoiCtTD_YHSu48p51xmu9Y3TaulM";
      const RANGE = "DADOS";
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           setError("Acesso negado. Certifique-se de que sua conta do Google tem acesso à planilha.");
           setNeedsAuth(true); 
        } else {
           setError(`Erro ao conectar na API do Google Sheets: ${response.statusText}`);
        }
        setData(MOCK_DATA);
        return;
      }

      const rawResponse = await response.json();

      if (rawResponse.values && Array.isArray(rawResponse.values)) {
        const values = extractDashboardValues(rawResponse.values);
        setData(values);
        setError(null);
      } else {
        setData(MOCK_DATA);
      }
    } catch (err: any) {
      console.error("Failed to fetch sheet data", err);
      setError("Erro ao processar dados da planilha. Exibindo dados simulados.");
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize Auth listener from Firebase
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setNeedsAuth(false);
        fetchData();
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
        setData(MOCK_DATA);
        setLoading(false);
      }
    );

    // Initial manual fetch check
    fetchData();
    
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchData]);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        fetchData();
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Erro ao conectar. Por favor, torne a planilha pública.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setData(MOCK_DATA);
  };

  return { data, loading, error, needsAuth, handleLogin, handleLogout, user };
}
