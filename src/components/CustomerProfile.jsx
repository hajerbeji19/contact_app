function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

function formatDuration(seconds = 0) {
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`
}

function CustomerProfile({ contact, notes, calls, onBack, onAddNote, onStartCall }) {
  const status = contact.customerStatus ?? (contact.id === 1 ? 'VIP' : contact.id === 2 ? 'Nouveau client' : 'Régulier')

  function submitNote(event) {
    event.preventDefault()
    const form = event.currentTarget
    const text = new FormData(form).get('note').trim()
    if (!text) return
    onAddNote(text)
    form.reset()
  }

  return (
    <div className="workspace-page profile-page">
      <button className="back-button" onClick={onBack} type="button">← Retour aux contacts</button>
      <section className="profile-hero">
        <div className="profile-hero-main">
          <div className="profile-large-avatar">{initials(contact.name)}</div>
          <div className="profile-hero-copy">
            <span className="eyebrow">FICHE CLIENT</span>
            <h1>{contact.name}</h1>
            <p>{contact.company.name} <span>·</span> {contact.address.city}</p>
            <span className={`customer-status ${status === 'VIP' ? 'status-vip' : status === 'Nouveau client' ? 'status-new' : 'status-regular'}`}>
              <i /> {status}
            </span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="secondary-button" onClick={onStartCall} type="button"><span aria-hidden="true">☎</span> Démarrer un appel</button>
          <a className="secondary-button" href={`mailto:${contact.email}`}><span aria-hidden="true">✉</span> Envoyer un e-mail</a>
        </div>
      </section>

      <div className="profile-columns">
        <div className="profile-main-column">
          <section className="dashboard-panel profile-section">
            <div className="panel-heading"><div><h2>Coordonnées</h2><p>Informations du répertoire</p></div></div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-icon">☎</span><div><small>Téléphone</small><strong>{contact.phone}</strong></div></div>
              <div className="detail-item"><span className="detail-icon">✉</span><div><small>Adresse e-mail</small><strong>{contact.email}</strong></div></div>
              <div className="detail-item"><span className="detail-icon">⌖</span><div><small>Ville</small><strong>{contact.address.city}</strong></div></div>
              <div className="detail-item"><span className="detail-icon">▦</span><div><small>Entreprise</small><strong>{contact.company.name}</strong></div></div>
              {contact.website && <div className="detail-item"><span className="detail-icon">↗</span><div><small>Site web</small><strong>{contact.website}</strong></div></div>}
            </div>
          </section>

          <section className="dashboard-panel profile-section">
            <div className="panel-heading">
              <div><h2>Historique des appels</h2><p>Retrouvez les échanges récents avec ce client.</p></div>
              <span className="history-count">{calls.length}</span>
            </div>
            {calls.length ? (
              <div className="call-history-list">
                {calls.map((call) => (
                  <div className="call-history-row" key={call.id}>
                    <span className="history-call-icon">☎</span>
                    <div className="history-call-copy"><strong>Appel terminé</strong><span>{formatDate(call.endedAt)}</span></div>
                    <span className="history-call-duration">{formatDuration(call.duration)}</span>
                  </div>
                ))}
              </div>
            ) : <div className="profile-empty-state"><span>◷</span><p>Aucun appel enregistré. Vous pourrez consulter ici l’historique de vos échanges.</p></div>}
          </section>
        </div>

        <aside className="profile-side-column">
          <section className="dashboard-panel profile-section last-contact-card">
            <div className="panel-heading"><div><h2>Dernier contact</h2><p>Activité la plus récente</p></div></div>
            {calls[0] ? (
              <div className="last-contact-content"><span className="last-contact-date">{formatDate(calls[0].endedAt)}</span><strong>Appel sortant</strong><span>Durée : {formatDuration(calls[0].duration)}</span></div>
            ) : <div className="last-contact-content"><strong>Pas encore de contact</strong><span>Simulez un appel pour démarrer l’historique.</span></div>}
          </section>

          <section className="dashboard-panel profile-section notes-section">
            <div className="panel-heading"><div><h2>Notes de Hajer</h2><p>Vos mémos personnels sur ce client</p></div><span className="notes-icon">✎</span></div>
            <form className="note-form" onSubmit={submitNote}>
              <label className="visually-hidden" htmlFor="client-note">Ajouter une note</label>
              <textarea id="client-note" name="note" placeholder="Notez les informations utiles après votre échange…" required rows="3" />
              <button className="primary-button" type="submit">Enregistrer la note</button>
            </form>
            <div className="notes-list">
              {notes.length ? notes.map((note) => (
                <article className="note-entry" key={note.id}>
                  <p>{note.text}</p><time>{formatDate(note.createdAt)}</time>
                </article>
              )) : <p className="notes-empty">Vos notes apparaîtront ici.</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default CustomerProfile
