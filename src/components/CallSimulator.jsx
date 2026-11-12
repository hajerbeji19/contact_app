import { useEffect, useState } from 'react'

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return hours ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function CallSimulator({ contacts, activeCall, lastCall, onStartCall, onToggleMute, onEndCall, onOpenProfile }) {
  const [selectedId, setSelectedId] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const selectedContact = contacts.find((contact) => String(contact.id) === selectedId) ?? contacts[0]
  const callContact = activeCall?.contact

  useEffect(() => {
    if (!activeCall) return undefined
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeCall.startedAt) / 1000))
    }, 500)
    return () => window.clearInterval(interval)
  }, [activeCall])

  return (
    <div className="workspace-page calls-page">
      <div className="page-heading">
        <div><span className="eyebrow">ESPACE TÉLÉPHONIQUE</span><h1>Espace appels</h1><p>Gérez vos conversations et retrouvez facilement leur historique.</p></div>
        <span className="service-pill"><i /> Ligne disponible</span>
      </div>

      <div className="call-workspace-grid">
        <section className={`call-console${activeCall ? ' call-is-active' : ''}`}>
          <div className="console-topline"><span className="console-live"><i /> {activeCall ? activeCall.status === 'Calling' ? 'APPEL EN COURS' : 'EN CONVERSATION' : 'POSTE DE L’AGENT'}</span><span className="console-lock">Kallemni · Centre de contacts</span></div>
          {activeCall ? (
            <div className="call-active-content">
              <div className="call-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="call-avatar-wrap"><span className="call-avatar">{initials(callContact.name)}</span><i /></div>
              <span className="call-status-label">{activeCall.status === 'Calling' ? 'Appel en cours…' : 'Vous êtes en ligne avec'}</span>
              <h2>{callContact.name}</h2>
              <p>{callContact.phone}</p>
              <span className="call-company">{callContact.company.name}</span>
              <div className="call-timer" aria-live="polite">{formatTime(elapsed)}</div>
              <div className="call-state-steps">
                <span className="call-step done"><i /> Calling</span><span className="step-line" /><span className={`call-step${activeCall.status === 'In Progress' ? ' done' : ''}`}><i /> In Progress</span><span className="step-line" /><span className="call-step"><i /> Completed</span>
              </div>
              <div className="call-controls">
                <button aria-pressed={activeCall.muted} className={`mute-button${activeCall.muted ? ' is-muted' : ''}`} onClick={onToggleMute} type="button"><span aria-hidden="true">♫</span>{activeCall.muted ? 'Réactiver le son' : 'Muet'}</button>
                <button className="end-call-button" onClick={onEndCall} type="button"><span>☎</span> Terminer l’appel</button>
              </div>
            </div>
          ) : (
            <div className="call-idle-content">
              <div className="idle-call-illustration"><span>☎</span><i /><i /><i /></div>
              <span className="call-status-label">PRÊTE POUR VOTRE PROCHAIN APPEL ?</span>
              <h2>Démarrez un appel</h2>
              <p>Choisissez un contact pour afficher sa fiche et démarrer une conversation.</p>
              <div className="call-contact-picker">
                <label htmlFor="call-contact-select">Choisir un contact</label>
                <select id="call-contact-select" disabled={!contacts.length} onChange={(event) => setSelectedId(event.target.value)} value={selectedContact ? String(selectedContact.id) : ''}>
                  {contacts.length ? contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} — {contact.phone}</option>) : <option value="">Chargement des contacts…</option>}
                </select>
              </div>
              <div className="idle-call-actions">
                <button className="primary-button call-start-button" disabled={!selectedContact} onClick={() => selectedContact && onStartCall(selectedContact)} type="button">☎ <span>Démarrer l’appel</span></button>
                {selectedContact && <button className="text-button" onClick={() => onOpenProfile(selectedContact)} type="button">Consulter la fiche client</button>}
              </div>
              {lastCall && (
                <div className="last-call-summary">
                  <span>✓</span> Dernier appel avec <strong>{lastCall.contact.name}</strong>
                  <button onClick={() => onOpenProfile(lastCall.contact)} type="button">Ajouter une note</button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="call-side-panel">
          <section className="dashboard-panel call-info-card">
            <div className="panel-heading"><div><h2>Comment ça marche</h2><p>Un espace d’entraînement sans risque</p></div></div>
            <ol className="call-howto">
              <li><span>1</span><div><strong>Choisissez un contact</strong><small>La fiche et les coordonnées s’affichent.</small></div></li>
              <li><span>2</span><div><strong>Démarrez un appel</strong><small>Le chronomètre démarre automatiquement.</small></div></li>
              <li><span>3</span><div><strong>Ajoutez vos notes</strong><small>Retrouvez-les ensuite sur la fiche client.</small></div></li>
            </ol>
          </section>
          <section className="dashboard-panel call-safety-card"><span className="safety-icon">✦</span><div><strong>Conseil de l’agent</strong><p>Prenez le temps d’écouter la demande du client et de personnaliser votre réponse.</p></div></section>
        </aside>
      </div>
    </div>
  )
}

export default CallSimulator
