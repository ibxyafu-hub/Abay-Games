import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Plus, Edit, Check, AlertCircle, RefreshCw, Trophy, Users, User, Calendar, BarChart2, DollarSign, Upload, Download, FileText, CheckCircle2 } from 'lucide-react';
import { ToastMessage } from '../types';

interface AdminPanelProps {
  onBack: () => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, showToast }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leagues' | 'teams' | 'players' | 'fixtures' | 'stats' | 'import'>('dashboard');

  // Data states
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [qualitySummary, setQualitySummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Import states
  const [importType, setImportType] = useState<'teams' | 'players' | 'fixtures' | 'stats'>('teams');
  const [importCsvText, setImportCsvText] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Forms states
  const [leagueForm, setLeagueForm] = useState({ id: '', name: '', slug: '', accent_color: '#0B4F9E', is_active: true });
  const [teamForm, setTeamForm] = useState({ id: '', name: '', short_name: '', logo_url: '', league_id: 'premier-league' });
  const [playerForm, setPlayerForm] = useState({ id: '', name: '', club: '', position: 'MID', price: 5.0, league_id: 'premier-league', nationality: '', age: 24, photo_url: '', active: true });
  const [fixtureForm, setFixtureForm] = useState({ id: '', league_id: 'premier-league', home_team_id: '', away_team_id: '', kickoff_at: new Date().toISOString().slice(0, 16), status: 'scheduled', home_score: 0, away_score: 0 });
  const [statForm, setStatForm] = useState({ fixture_id: '', player_id: '', minutes: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 });

  const getAuthHeaders = () => {
    const initData = (window as any).Telegram?.WebApp?.initData || '';
    return {
      'Content-Type': 'application/json',
      'x-telegram-init-data': initData,
    };
  };

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        const initData = (window as any).Telegram?.WebApp?.initData || '';
        const res = await fetch('/api/admin/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        });
        const data = await res.json();
        if (data.success && data.isAdmin) {
          setIsAuthenticated(true);
          fetchAllData();
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    try {
      const [lRes, tRes, pRes, fRes, sRes, qRes] = await Promise.all([
        fetch('/api/admin/fantasy/leagues', { headers }),
        fetch('/api/admin/fantasy/teams', { headers }),
        fetch('/api/admin/fantasy/players', { headers }),
        fetch('/api/admin/fantasy/fixtures', { headers }),
        fetch('/api/admin/fantasy/player-stats', { headers }),
        fetch('/api/admin/fantasy/quality-summary', { headers }),
      ]);

      if (lRes.ok) { const d = await lRes.json(); setLeagues(d.leagues || []); }
      if (tRes.ok) { const d = await tRes.json(); setTeams(d.teams || []); }
      if (pRes.ok) { const d = await pRes.json(); setPlayers(d.players || []); }
      if (fRes.ok) { const d = await fRes.json(); setFixtures(d.fixtures || []); }
      if (sRes.ok) { const d = await sRes.json(); setStats(d.stats || []); }
      if (qRes.ok) { const d = await qRes.json(); setQualitySummary(d.summary || null); }
      setIsAuthenticated(true);
    } catch (err) {
      showToast('Error loading admin data', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handlers
  const handleSaveLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fantasy/leagues', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leagueForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('League saved successfully', 'success');
      fetchAllData();
      setLeagueForm({ id: '', name: '', slug: '', accent_color: '#0B4F9E', is_active: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to save league', 'warning');
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fantasy/teams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(teamForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Team saved successfully', 'success');
      fetchAllData();
      setTeamForm({ id: '', name: '', short_name: '', logo_url: '', league_id: 'premier-league' });
    } catch (err: any) {
      showToast(err.message || 'Failed to save team', 'warning');
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fantasy/players', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(playerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Player saved successfully (price history & default 5.0M handled)', 'success');
      fetchAllData();
      setPlayerForm({ id: '', name: '', club: '', position: 'MID', price: 5.0, league_id: 'premier-league', nationality: '', age: 24, photo_url: '', active: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to save player', 'warning');
    }
  };

  const handleSaveFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fixtureForm.home_team_id === fixtureForm.away_team_id) {
      showToast('A team cannot play against itself!', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/admin/fantasy/fixtures', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fixtureForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Fixture created/updated successfully', 'success');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save fixture', 'warning');
    }
  };

  const handleSaveStat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fantasy/player-stats', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(statForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Stats submitted! Server calculated Fantasy Points: +${data.stats.fantasy_points}`, 'success');
      fetchAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit match stats', 'warning');
    }
  };

  if (!isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0B4F9E] animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying Admin Authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center text-red-600 mb-3">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold font-sora text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">Your Telegram ID is not authorized to access the Football Data Admin Portal.</p>
          <button
            onClick={onBack}
            className="bg-[#0B4F9E] text-white px-6 py-2.5 rounded-xl font-sora font-bold text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Admin Header */}
      <header className="bg-blue-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sky-400" />
            <div>
              <h1 className="text-xl font-bold">Abay Games Fantasy Admin</h1>
              <p className="text-xs text-sky-200">Internal Football Data Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllData()}
              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-xs font-medium rounded flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-xs font-medium rounded flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
            { id: 'leagues', label: 'Leagues', icon: Trophy },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'players', label: 'Players', icon: User },
            { id: 'fixtures', label: 'Fixtures', icon: Calendar },
            { id: 'stats', label: 'Player Stats', icon: Shield },
            { id: 'import', label: 'Import Data', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing data with Supabase...
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Leagues</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{leagues.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Teams</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{teams.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Players</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{players.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Fixtures</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{fixtures.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Match Stats Recorded</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Data Quality Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-slate-500">Leagues</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{qualitySummary?.leagues ?? leagues.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-slate-500">Teams</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{qualitySummary?.teams ?? teams.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-slate-500">Players</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{qualitySummary?.players ?? players.length}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700">Active Players</p>
                  <p className="text-xl font-bold text-emerald-900 mt-1">{qualitySummary?.activePlayers ?? players.filter(p => p.active !== false).length}</p>
                </div>
                <div className={`p-4 rounded-lg border ${(qualitySummary?.playersWithoutTeam || 0) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
                  <p className="text-xs text-slate-500">Players without team</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{qualitySummary?.playersWithoutTeam ?? 0}</p>
                </div>
                <div className={`p-4 rounded-lg border ${(qualitySummary?.playersWithoutPrice || 0) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
                  <p className="text-xs text-slate-500">Players without price</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{qualitySummary?.playersWithoutPrice ?? 0}</p>
                </div>
                <div className={`p-4 rounded-lg border ${(qualitySummary?.duplicateExternalIds || 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}>
                  <p className="text-xs text-slate-500">Duplicate external IDs</p>
                  <p className="text-xl font-bold text-red-700 mt-1">{qualitySummary?.duplicateExternalIds ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Abay Games Fantasy Administration Guide</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Welcome to the Abay Games internal football data management portal. All mutations are secured server-side via{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700">ABAY_ADMIN_SECRET</code>.
                Player match statistics entered here automatically calculate official Fantasy points server-side using the centralized scoring engine.
              </p>
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create / Edit League</h3>
              <form onSubmit={handleSaveLeague} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">League ID / Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. premier-league"
                    value={leagueForm.id}
                    onChange={(e) => setLeagueForm({ ...leagueForm, id: e.target.value, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">League Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. English Premier League"
                    value={leagueForm.name}
                    onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Accent Color</label>
                  <input
                    type="text"
                    value={leagueForm.accent_color}
                    onChange={(e) => setLeagueForm({ ...leagueForm, accent_color: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={leagueForm.is_active}
                    onChange={(e) => setLeagueForm({ ...leagueForm, is_active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active League</label>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save League
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Leagues</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Slug</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leagues.map((lg) => (
                      <tr key={lg.id}>
                        <td className="py-3 px-3 font-medium">{lg.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-xs">{lg.slug}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${lg.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {lg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create Team</h3>
              <form onSubmit={handleSaveTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manchester City"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value, short_name: e.target.value.substring(0, 3).toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Short Name / Code</label>
                  <input
                    type="text"
                    required
                    placeholder="MCI"
                    value={teamForm.short_name}
                    onChange={(e) => setTeamForm({ ...teamForm, short_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">League</label>
                  <select
                    value={teamForm.league_id}
                    onChange={(e) => setTeamForm({ ...teamForm, league_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="premier-league">Premier League</option>
                    <option value="la-liga">La Liga</option>
                    <option value="serie-a">Serie A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={teamForm.logo_url}
                    onChange={(e) => setTeamForm({ ...teamForm, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save Team
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Teams List ({teams.length})</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">Team</th>
                      <th className="py-2 px-3">Short</th>
                      <th className="py-2 px-3">League</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.map((tm) => (
                      <tr key={tm.id}>
                        <td className="py-3 px-3 font-medium flex items-center gap-2">
                          {tm.logo_url && <img src={tm.logo_url} alt="" className="w-6 h-6 object-contain" />}
                          {tm.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs">{tm.short_name}</td>
                        <td className="py-3 px-3 text-slate-600">{tm.league_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create / Edit Player</h3>
              <form onSubmit={handleSavePlayer} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Player Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Erling Haaland"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Club</label>
                    <input
                      type="text"
                      required
                      placeholder="Manchester City"
                      value={playerForm.club}
                      onChange={(e) => setPlayerForm({ ...playerForm, club: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Position</label>
                    <select
                      value={playerForm.position}
                      onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="GK">GK</option>
                      <option value="DEF">DEF</option>
                      <option value="MID">MID</option>
                      <option value="FWD">FWD</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fantasy Price (M)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={playerForm.price}
                      onChange={(e) => setPlayerForm({ ...playerForm, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">League</label>
                    <select
                      value={playerForm.league_id}
                      onChange={(e) => setPlayerForm({ ...playerForm, league_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="premier-league">Premier League</option>
                      <option value="la-liga">La Liga</option>
                      <option value="serie-a">Serie A</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Photo URL / Avatar</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={playerForm.photo_url}
                    onChange={(e) => setPlayerForm({ ...playerForm, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save Player (Default 5.0M)
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Players Directory ({players.length})</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">Player</th>
                      <th className="py-2 px-3">Pos</th>
                      <th className="py-2 px-3">Club</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {players.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-3 font-medium flex items-center gap-2">
                          {p.photo_url || p.avatar ? (
                            <img src={p.photo_url || p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                              {p.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          {p.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">{p.position}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.club}</td>
                        <td className="py-3 px-3 font-semibold text-blue-600">{p.price}M</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">{p.points || 0} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create Fixture</h3>
              <form onSubmit={handleSaveFixture} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">League</label>
                  <select
                    value={fixtureForm.league_id}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, league_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="premier-league">Premier League</option>
                    <option value="la-liga">La Liga</option>
                    <option value="serie-a">Serie A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Home Team ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Team ID"
                    value={fixtureForm.home_team_id}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, home_team_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Away Team ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Team ID"
                    value={fixtureForm.away_team_id}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, away_team_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kickoff Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={fixtureForm.kickoff_at}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, kickoff_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select
                      value={fixtureForm.status}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="finished">Finished</option>
                      <option value="postponed">Postponed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Score (H - A)</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={fixtureForm.home_score}
                        onChange={(e) => setFixtureForm({ ...fixtureForm, home_score: parseInt(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-md text-sm"
                      />
                      <input
                        type="number"
                        value={fixtureForm.away_score}
                        onChange={(e) => setFixtureForm({ ...fixtureForm, away_score: parseInt(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save Fixture
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Fixtures ({fixtures.length})</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">League</th>
                      <th className="py-2 px-3">Teams</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fixtures.map((fx) => (
                      <tr key={fx.id}>
                        <td className="py-3 px-3 text-slate-600">{fx.league_id}</td>
                        <td className="py-3 px-3 font-medium">{fx.home_team_id} vs {fx.away_team_id}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${fx.status === 'live' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                            {fx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">{fx.home_score} - {fx.away_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Player Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enter Match Statistics</h3>
              <p className="text-xs text-slate-500 mb-4">Fantasy points are calculated automatically server-side.</p>
              <form onSubmit={handleSaveStat} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fixture ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Fixture UUID / ID"
                    value={statForm.fixture_id}
                    onChange={(e) => setStatForm({ ...statForm, fixture_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Player ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Player UUID / ID"
                    value={statForm.player_id}
                    onChange={(e) => setStatForm({ ...statForm, player_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Minutes Played</label>
                    <input
                      type="number"
                      value={statForm.minutes}
                      onChange={(e) => setStatForm({ ...statForm, minutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Goals</label>
                    <input
                      type="number"
                      value={statForm.goals}
                      onChange={(e) => setStatForm({ ...statForm, goals: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Assists</label>
                    <input
                      type="number"
                      value={statForm.assists}
                      onChange={(e) => setStatForm({ ...statForm, assists: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Clean Sheet</label>
                    <select
                      value={statForm.clean_sheet ? 'true' : 'false'}
                      onChange={(e) => setStatForm({ ...statForm, clean_sheet: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes (+4 / +1)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Yellow Cards</label>
                    <input
                      type="number"
                      value={statForm.yellow_cards}
                      onChange={(e) => setStatForm({ ...statForm, yellow_cards: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Red Cards</label>
                    <input
                      type="number"
                      value={statForm.red_cards}
                      onChange={(e) => setStatForm({ ...statForm, red_cards: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
                  Calculate & Submit Stats
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recorded Match Stats ({stats.length})</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">Player ID</th>
                      <th className="py-2 px-3">Mins</th>
                      <th className="py-2 px-3">Goals</th>
                      <th className="py-2 px-3">Assists</th>
                      <th className="py-2 px-3">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.map((st) => (
                      <tr key={st.id || `${st.fixture_id}_${st.player_id}`}>
                        <td className="py-3 px-3 font-mono text-xs">{st.player_id}</td>
                        <td className="py-3 px-3">{st.minutes}m</td>
                        <td className="py-3 px-3 font-semibold">{st.goals}</td>
                        <td className="py-3 px-3 font-semibold">{st.assists}</td>
                        <td className="py-3 px-3 font-bold text-blue-600">+{st.fantasy_points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Data Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Football Data CSV Importer</h3>
                  <p className="text-sm text-slate-500">Upload structured CSV files to import Teams, Players, Fixtures, or Match Stats securely.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Select Type:</span>
                  <select
                    value={importType}
                    onChange={(e) => {
                      setImportType(e.target.value as any);
                      setImportPreview(null);
                      setImportSummary(null);
                    }}
                    className="px-3 py-1.5 border rounded-lg text-sm font-medium bg-slate-50 text-slate-800"
                  >
                    <option value="teams">Teams CSV</option>
                    <option value="players">Players CSV</option>
                    <option value="fixtures">Fixtures CSV</option>
                    <option value="stats">Player Match Stats CSV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">1. Download Template</label>
                  <p className="text-xs text-slate-500">Download the official sample CSV template containing fictional test data for {importType}.</p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/fantasy/templates/${importType}`, { headers: getAuthHeaders() });
                        if (!res.ok) throw new Error('Failed to download template');
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${importType}_template.csv`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        showToast('Template downloaded successfully', 'success');
                      } catch (err) {
                        showToast('Error downloading template', 'warning');
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" /> Download {importType.toUpperCase()} Template (.csv)
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">2. Upload CSV File</label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string || '';
                        setImportCsvText(content);
                        setImportPreview(null);
                        setImportSummary(null);
                        showToast('CSV file loaded into editor', 'success');
                      };
                      reader.readAsText(file);
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">3. CSV Data Editor (Paste or Verify)</label>
                <textarea
                  rows={8}
                  value={importCsvText}
                  onChange={(e) => {
                    setImportCsvText(e.target.value);
                    setImportPreview(null);
                    setImportSummary(null);
                  }}
                  placeholder="Paste CSV content here..."
                  className="w-full font-mono text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={!importCsvText.trim() || isImporting}
                  onClick={async () => {
                    setIsImporting(true);
                    setImportSummary(null);
                    try {
                      const res = await fetch('/api/admin/fantasy/import', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ importType, csvData: importCsvText, dryRun: true })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Validation failed');
                      setImportPreview(data);
                      if (data.invalidRowsCount === 0) {
                        showToast('Validation passed successfully!', 'success');
                      } else {
                        showToast(`Validation found ${data.invalidRowsCount} invalid row(s)`, 'warning');
                      }
                    } catch (err: any) {
                      showToast(err.message || 'Validation error', 'warning');
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Preview & Validate
                </button>

                <button
                  disabled={!importPreview || importPreview.invalidRowsCount > 0 || isImporting}
                  onClick={async () => {
                    if (!window.confirm(`Are you sure you want to import ${importPreview?.validRowsCount} valid row(s)?`)) return;
                    setIsImporting(true);
                    try {
                      const res = await fetch('/api/admin/fantasy/import', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ importType, csvData: importCsvText, dryRun: false })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Import failed');
                      setImportSummary(data.summary);
                      showToast('Import completed successfully!', 'success');
                      fetchAllData();
                    } catch (err: any) {
                      showToast(err.message || 'Import failed', 'warning');
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Confirm & Import
                </button>
              </div>
            </div>

            {/* Import Preview Results */}
            {importPreview && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-600" /> Import Preview & Validation Report
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-slate-500">Rows Detected</p>
                    <p className="text-2xl font-bold text-slate-900">{importPreview.rowsDetected}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-700">Valid Rows</p>
                    <p className="text-2xl font-bold text-emerald-900">{importPreview.validRowsCount}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${importPreview.invalidRowsCount > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${importPreview.invalidRowsCount > 0 ? 'text-red-700 font-bold' : 'text-slate-500'}`}>Invalid Rows</p>
                    <p className={`text-2xl font-bold ${importPreview.invalidRowsCount > 0 ? 'text-red-900' : 'text-slate-900'}`}>{importPreview.invalidRowsCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className={`text-sm font-bold mt-1 ${importPreview.invalidRowsCount === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {importPreview.invalidRowsCount === 0 ? 'Ready to Import' : 'Fix Errors Before Import'}
                    </p>
                  </div>
                </div>

                {importPreview.validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" /> Validation Errors ({importPreview.validationErrors.length})
                    </p>
                    <ul className="space-y-1 text-xs text-red-700 max-h-48 overflow-y-auto font-mono">
                      {importPreview.validationErrors.map((err: any, i: number) => (
                        <li key={i} className="p-1 bg-white/60 rounded border border-red-100">
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Import Summary */}
            {importSummary && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl space-y-3">
                <h4 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Import Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                    <span className="text-slate-500 block">Created</span>
                    <span className="text-xl font-bold text-emerald-600">{importSummary.created}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                    <span className="text-slate-500 block">Updated</span>
                    <span className="text-xl font-bold text-blue-600">{importSummary.updated}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                    <span className="text-slate-500 block">Skipped</span>
                    <span className="text-xl font-bold text-slate-700">{importSummary.skipped}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                    <span className="text-slate-500 block">Errors</span>
                    <span className="text-xl font-bold text-red-600">{importSummary.errors}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
