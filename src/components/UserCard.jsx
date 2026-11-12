function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function UserCard({ user, isFavorite, onToggleFavorite, onSelect, onStartCall, avatarColor }) {
  return (
    <article className="contact-card">
      <div className="card-topline">
        <span className={`contact-avatar avatar-${avatarColor}`} aria-hidden="true">
          {getInitials(user.name)}
        </span>
        <button
          aria-label={isFavorite ? `Retirer ${user.name} des favoris` : `Ajouter ${user.name} aux favoris`}
          aria-pressed={isFavorite}
          className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
          onClick={onToggleFavorite}
          type="button"
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <h2 className="contact-name"><button className="contact-name-link" onClick={onSelect} type="button">{user.name}</button></h2>
      <p className="contact-company">{user.company.name}</p>
      <p className="contact-city"><span aria-hidden="true">⌖</span> {user.address.city}</p>
      <p className="contact-phone"><span aria-hidden="true">☎</span> {user.phone}</p>
      <a className="contact-email" href={`mailto:${user.email}`} title={user.email}>{user.email}</a>
      <div className="card-actions">
        <button aria-label={`Démarrer un appel avec ${user.name}`} onClick={onStartCall} title="Démarrer un appel" type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.2 2 2 0 0 1 4.1 1h3a2 2 0 0 1 2 1.7l.5 3.2a2 2 0 0 1-.6 1.7L7.1 9.5a16 16 0 0 0 7.4 7.4l1.9-1.9a2 2 0 0 1 1.7-.6l3.2.5a2 2 0 0 1 1.7 2z" /></svg>
        </button>
        <a aria-label={`Envoyer un e-mail à ${user.name}`} href={`mailto:${user.email}`} title={`Envoyer un e-mail à ${user.name}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </a>
        <button className="profile-link-button" onClick={onSelect} type="button">Fiche client <span aria-hidden="true">↗</span></button>
      </div>
    </article>
  )
}

export default UserCard
