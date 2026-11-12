function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function Dashboard({ contacts, callLogs, activeCall, onOpenProfile, onNavigate }) {
  const completedCalls = callLogs.filter((call) => call.status === 'Completed').length
  const successfulCalls = callLogs.filter((call) => call.status === 'Completed').length
  const todayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const count = callLogs.filter((call) => new Date(call.startedAt).toDateString() === date.toDateString()).length
    return {
      label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date).replace('.', ''),
      count,
    }
  })
  const maxCalls = Math.max(...days.map((day) => day.count), 1)
  const recentContacts = contacts.slice(0, 5)

  return (
    <div className="workspace-page">
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">{todayLabel}</span>
          <h1>Bonjour Hajer <span aria-hidden="true">✦</span></h1>
          <p>Voici le résumé de votre activité aujourd’hui.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('contacts')} type="button">
          <span aria-hidden="true">＋</span> Nouveau contact
        </button>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon kpi-blue">♧</span><span className="kpi-trend">Votre répertoire</span></div>
          <strong>{contacts.length}</strong><span className="kpi-label">Total contacts</span>
          <div className="kpi-sparkline spark-blue" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon kpi-purple">☎</span><span className="kpi-trend">Au total</span></div>
          <strong>{completedCalls}</strong><span className="kpi-label">Appels effectués</span>
          <div className="kpi-sparkline spark-purple" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon kpi-green">✓</span><span className="kpi-trend">Terminés</span></div>
          <strong>{successfulCalls}</strong><span className="kpi-label">Appels réussis</span>
          <div className="kpi-sparkline spark-green" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon kpi-amber">◷</span><span className="kpi-trend">{activeCall?.status === 'Calling' ? 'En attente' : 'Tout est à jour'}</span></div>
          <strong>{activeCall?.status === 'Calling' ? '01' : '00'}</strong><span className="kpi-label">Appels en attente</span>
          <div className="kpi-sparkline spark-amber" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
      </div>

      <div className="dashboard-panels">
        <section className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div><h2>Activité des appels</h2><p>Appels effectués, sur les 7 derniers jours</p></div>
            <span className="panel-badge"><span /> Cette semaine</span>
          </div>
          {callLogs.length ? (
            <div className="activity-chart" role="img" aria-label="Nombre d’appels par jour cette semaine">
              <div className="chart-y-labels"><span>{maxCalls}</span><span>{Math.ceil(maxCalls / 2)}</span><span>0</span></div>
              <div className="chart-bars">
                {days.map((day, index) => (
                  <div className="chart-day" key={`${day.label}-${index}`}>
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ height: `${Math.max((day.count / maxCalls) * 100, day.count ? 8 : 2)}%` }} title={`${day.count} appel${day.count === 1 ? '' : 's'}`} />
                    </div>
                    <span>{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">
              <div className="empty-chart-icon">▥</div>
              <strong>Votre activité apparaîtra ici</strong>
              <span>Effectuez votre premier appel pour commencer le suivi.</span>
              <button className="text-button" onClick={() => onNavigate('calls')} type="button">Ouvrir l’espace appels →</button>
            </div>
          )}
          <div className="activity-footer"><span>Appels terminés</span><strong>{completedCalls}</strong><span>Durée moyenne</span><strong>{callLogs.length ? formatDuration(Math.round(callLogs.reduce((sum, call) => sum + call.duration, 0) / callLogs.length)) : '—'}</strong></div>
        </section>

        <section className="dashboard-panel satisfaction-panel">
          <div className="panel-heading">
            <div><h2>Satisfaction client</h2><p>Votre qualité de service</p></div>
            <span className="satisfaction-icon">♡</span>
          </div>
          <div className="satisfaction-score">96<span>%</span></div>
          <p className="satisfaction-copy">Un accueil chaleureux fait toute la différence.</p>
          <div className="satisfaction-meter"><span /></div>
          <div className="satisfaction-legend"><span><i /> Très satisfait</span><strong>Objectif</strong></div>
          <div className="satisfaction-tip"><span>✦</span><p>Astuce du jour : terminez chaque appel en vérifiant que le client n’a plus de question.</p></div>
        </section>
      </div>

      <section className="dashboard-panel recent-contacts-panel">
        <div className="panel-heading">
          <div><h2>Contacts à portée de main</h2><p>Accédez rapidement à une fiche client.</p></div>
          <button className="text-button" onClick={() => onNavigate('contacts')} type="button">Voir le répertoire →</button>
        </div>
        {recentContacts.length ? (
          <div className="dashboard-contact-list">
            {recentContacts.map((contact, index) => (
              <button className="dashboard-contact-row" key={contact.id} onClick={() => onOpenProfile(contact)} type="button">
                <span className={`recent-avatar avatar-${['blue', 'green', 'purple', 'orange', 'pink'][index % 5]}`}>{initials(contact.name)}</span>
                <span className="recent-person"><strong>{contact.name}</strong><span>{contact.company.name}</span></span>
                <span className="dashboard-contact-city">{contact.address.city}</span>
                <span className="row-chevron">↗</span>
              </button>
            ))}
          </div>
        ) : <div className="dashboard-no-contacts">Chargement du répertoire…</div>}
      </section>
    </div>
  )
}

export default Dashboard
