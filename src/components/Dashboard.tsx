import { useDashboardData } from '../hooks/useDashboardData';
import { KPICard } from './KPICard';
import { FunnelChart } from './FunnelChart';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import { 
  Users, 
  UserPlus, 
  Search, 
  Target, 
  Stethoscope, 
  ArrowRight,
  TrendingDown,
  DollarSign,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { data, loading, error, needsAuth, handleLogin, handleLogout, user } = useDashboardData();

  if (loading && !needsAuth && !data.inscritos) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-card-border border-t-in-green" />
          <p className="text-gray-400 font-mono text-sm animate-pulse">Sincronizando com Google Sheets...</p>
        </div>
      </div>
    );
  }

  const funnelData = [
    { name: 'Inscritos', value: data.inscritos },
    { name: 'Grupo', value: data.entradasGrupo },
    { name: 'Pesquisas', value: data.pesquisas },
    { name: 'ICPs', value: data.icps },
    { name: 'Diagnósticos', value: data.diagnosticos },
  ];

  return (
    <div className="min-h-screen bg-bg-base w-full pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-bg-card-border bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-in-green flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">inChurch Dashboard</h1>
              <p className="text-xs text-in-green font-mono">LIVE / METRICS</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {error && (
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium border border-yellow-500/20">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden xl:inline">{error}</span>
                <span className="xl:hidden">Modo Demo</span>
              </div>
            )}
            
            {needsAuth ? (
              <button onClick={handleLogin} className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm py-2 px-4 rounded-xl transition shadow-sm border border-gray-200">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Conectar Planilha
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user?.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-bg-card-border" />
                  )}
                  <span className="text-sm font-medium text-gray-300 hidden sm:inline-block">{user?.displayName?.split(' ')[0] || 'Logado'}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-bg-card transition" title="Sair">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        
        {/* Core Metrics Grid */}
        <div>
          <h2 className="text-sm font-mono text-gray-500 mb-4 px-2 uppercase tracking-widest">Aquisição</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard 
              title="Total de Inscritos" 
              value={formatNumber(data.inscritos)} 
              icon={<Users className="w-5 h-5" />}
              delay={0.1}
            />
            <KPICard 
              title="Entradas no Grupo" 
              value={formatNumber(data.entradasGrupo)} 
              icon={<UserPlus className="w-5 h-5" />}
              delay={0.15}
            />
            <KPICard 
              title="Total de Pesquisas" 
              value={formatNumber(data.pesquisas)} 
              icon={<Search className="w-5 h-5" />}
              delay={0.2}
            />
            <KPICard 
              title="Total de ICPs" 
              value={formatNumber(data.icps)} 
              icon={<Target className="w-5 h-5" />}
              delay={0.25}
            />
            <KPICard 
              title="Diagnósticos" 
              value={formatNumber(data.diagnosticos)} 
              icon={<Stethoscope className="w-5 h-5" />}
              delay={0.3}
              highlight
            />
          </div>
        </div>

        {/* Funnel & Growth Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
             <FunnelChart data={funnelData} />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-mono text-gray-500 mb-1 px-2 uppercase tracking-widest">Taxas de Conversão</h2>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-bg-card border border-bg-card-border rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Inscritos → Grupo</span>
                <span className="text-2xl font-bold text-white">{formatPercent(data.taxaInscritosGrupo)}</span>
              </div>
              <ArrowRight className="text-in-green w-5 h-5 opacity-50" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-bg-card border border-bg-card-border rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Grupo → Pesquisa</span>
                <span className="text-2xl font-bold text-white">{formatPercent(data.taxaGrupoPesquisa)}</span>
              </div>
              <ArrowRight className="text-in-green w-5 h-5 opacity-50" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-bg-card border border-bg-card-border rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Pesquisa → ICPs</span>
                <span className="text-2xl font-bold text-in-green">{formatPercent(data.taxaPesquisaIcp)}</span>
              </div>
              <Target className="text-in-green w-5 h-5 opacity-50" />
            </motion.div>
          </div>
        </div>

        {/* Financial / Tráfego */}
        <div>
          <h2 className="text-sm font-mono text-gray-500 mb-4 px-2 uppercase tracking-widest">Financeiro & Tráfego</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              title="Investimento Total" 
              value={formatCurrency(data.investimentoTrafego)} 
              icon={<DollarSign className="w-5 h-5" />}
              delay={0.4}
            />
            <KPICard 
              title="Meta de Leads" 
              value={formatNumber(data.leadsMeta)} 
              icon={<Target className="w-5 h-5" />}
              delay={0.5}
            />
            <KPICard 
              title="CPA / CPL (Meta)" 
              value={formatCurrency(data.cplMeta)} 
              delay={0.6}
            />
            <KPICard 
              title="CPA / CPL (Real)" 
              value={formatCurrency(data.cplReal)} 
              icon={<TrendingDown className="w-5 h-5" />}
              delay={0.7}
              highlight={data.cplReal <= data.cplMeta}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
