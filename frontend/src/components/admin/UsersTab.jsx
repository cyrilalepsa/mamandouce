export function UsersTab({ users, testUsers = [], userStats, loadUsers }) {
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // all, premium, free, trial
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Vérifier si on est en environnement de développement/preview
  const isDevelopment = window.location.hostname.includes('preview') || 
                        window.location.hostname.includes('localhost') ||
                        window.location.hostname.includes('127.0.0.1');
  
  // Filtrer les utilisateurs selon le statut
  const filteredUsers = users.filter(user => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'premium') return user.display_status === 'premium' || user.display_status === 'beta_tester';
    if (filterStatus === 'trial') return user.display_status === 'trial';
    if (filterStatus === 'free') return user.display_status === 'free' || !user.display_status;
    return true;
  });
  
  const { grouped, sortedYears } = groupUsersByDate(filteredUsers);
  
  // ✅ CORRECTION : Logique d'auto-expansion encapsulée dans un useEffect
  useEffect(() => {
    if (!initialized && sortedYears.length > 0) {
      const autoYears = {};
      const autoMonths = {};
      
      sortedYears.forEach(year => {
        autoYears[year] = true;
        const months = Object.keys(grouped[year]).sort((a, b) => b - a);
        if (months.length > 0) {
          autoMonths[`${year}-${months[0]}`] = true;
        }
      });
      
      setExpandedYears(autoYears);
      setExpandedMonths(autoMonths);
      setInitialized(true);
    }
  }, [sortedYears, initialized, grouped]);
  
  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };
  
  const toggleMonth = (year, month) => {
    const key = `${year}-${month}`;
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <div className="space-y-6">
      {/* Stats - uniquement les vrais utilisateurs */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Users className="w-7 h-7 text-sky-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-700">{userStats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Sparkles className="w-7 h-7 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{userStats.beta_tester}</p>
          <p className="text-xs text-slate-500">Bêta</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Star className="w-7 h-7 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-600">{userStats.premium}</p>
          <p className="text-xs text-slate-500">Premium</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Users className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-600">{userStats.free}</p>
          <p className="text-xs text-slate-500">Gratuit</p>
        </Card>
      </div>

      {/* Carte des utilisateurs de test - toujours visible pour l'admin */}
      {testUsers.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-dashed border-orange-300 rounded-3xl p-4">
          <button
            onClick={() => setShowTestUsers(!showTestUsers)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🧪</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-orange-700">Utilisateurs de test</p>
                <p className="text-xs text-orange-500">
                  {testUsers.length} compte{testUsers.length > 1 ? 's' : ''} test (non comptés dans les stats)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full font-medium">
                Comptes internes
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showTestUsers ? 'bg-orange-200 text-orange-700' : 'bg-orange-100 text-orange-400'}`}>
                {showTestUsers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </button>
          
          {showTestUsers && (
            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
              {testUsers.map((user, idx) => (
                <div 
                  key={user.id || idx}
                  className="bg-white/80 border border-orange-200 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{user.name || 'Sans nom'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Test
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Users List with filters */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Utilisateurs inscrits
          </h3>
          
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">Tous ({users.length})</option>
              <option value="premium">Premium</option>
              <option value="trial">En essai</option>
              <option value="free">Gratuit</option>
            </select>
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {sortedYears.map((year) => {
              const isYearExpanded = expandedYears[year] === true;
              const monthsInYear = Object.keys(grouped[year]).sort((a, b) => b - a);
              const totalUsersInYear = monthsInYear.reduce((sum, month) => sum + grouped[year][month].length, 0);
              
              return (
                <div key={year} className="border-2 border-slate-300 rounded-xl overflow-hidden">
                  {/* Header Année — fond coloré, texte foncé */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                    style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 100%)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{year.slice(-2)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-base">{year}</p>
                        <p className="text-xs text-slate-600 font-medium">{totalUsersInYear} utilisateur{totalUsersInYear > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isYearExpanded ? 'bg-sky-200 text-sky-700' : 'bg-slate-100 text-slate-400'}`}>
                      {isYearExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>
                  
                  {/* Contenu Année (mois) */}
                  {isYearExpanded && (
                    <div className="p-2 space-y-2">
                      {monthsInYear.map((month) => {
                        const monthKey = `${year}-${month}`;
                        const isMonthExpanded = expandedMonths[monthKey] === true;
                        const usersInMonth = grouped[year][month];
                        
                        return (
                          <div key={monthKey} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Header Mois — fond rose, texte foncé */}
                            <button
                              onClick={() => toggleMonth(year, month)}
                              className="w-full px-3 py-2 flex items-center justify-between transition-colors"
                              style={{ background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center">
                                  <span className="font-semibold text-xs">{getMonthName(parseInt(month)).slice(0, 3)}</span>
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-slate-800 text-sm">{getMonthName(parseInt(month))}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                  {usersInMonth.length}
                                </span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isMonthExpanded ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {isMonthExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </button>
                            
                            {/* Liste des utilisateurs du mois */}
                            {isMonthExpanded && (
                              <div className="p-2 space-y-2 bg-white">
                                {usersInMonth.map((user, idx) => (
                                  <UserCard 
                                    key={user.id || idx} 
                                    user={user} 
                                    index={idx} 
                                    loadUsers={loadUsers} 
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}