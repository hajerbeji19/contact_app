import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import UserCard from './UserCard.jsx'

const USERS_URL = 'https://jsonplaceholder.typicode.com/users'
const avatarColors = ['blue', 'green', 'purple', 'orange', 'pink', 'teal']

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function UserList({ onContactsChange, onSelectContact, onStartCall }) {
  const [users, setUsers] = useState([])
  const [addedUsers, setAddedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setLoading(true)
      setError('')

      try {
        const response = await axios.get(USERS_URL, { signal: controller.signal })
        setUsers(response.data.map((user) => ({
          ...user,
          customerStatus: user.id === 1 ? 'VIP' : user.id === 2 ? 'Nouveau client' : 'Régulier',
        })))
      } catch {
        if (!controller.signal.aborted) {
          setError('Les contacts n’ont pas pu être récupérés. Vérifiez votre connexion puis réessayez.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [retryCount])

  const allUsers = useMemo(() => [...addedUsers, ...users], [addedUsers, users])

  useEffect(() => {
    onContactsChange(allUsers)
  }, [allUsers, onContactsChange])
  const cities = useMemo(
    () => [...new Set(allUsers.map((user) => user.address.city))].sort((a, b) => a.localeCompare(b)),
    [allUsers],
  )
  const companies = useMemo(() => {
    const counts = allUsers.reduce((result, user) => {
      result[user.company.name] = (result[user.company.name] ?? 0) + 1
      return result
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [allUsers])
  const visibleUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    return allUsers
      .filter((user) => {
        const matchesSearch = [user.name, user.email, user.phone]
          .some((value) => value.toLocaleLowerCase().includes(query))
        const matchesCity = cityFilter === 'all' || user.address.city === cityFilter
        const matchesCompany = companyFilter === 'all' || user.company.name === companyFilter
        const matchesFavorites = !showFavoritesOnly || favorites.includes(user.id)
        return matchesSearch && matchesCity && matchesCompany && matchesFavorites
      })
      .sort((a, b) => {
        if (sortBy === 'city') return a.address.city.localeCompare(b.address.city)
        if (sortBy === 'company') return a.company.name.localeCompare(b.company.name)
        return a.name.localeCompare(b.name)
      })
  }, [allUsers, cityFilter, companyFilter, favorites, search, showFavoritesOnly, sortBy])

  function toggleFavorite(userId) {
    setFavorites((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ))
  }

  function addContact(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()

    setAddedUsers((current) => [
      {
        id: `local-${Date.now()}`,
        name,
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        address: { city: formData.get('city').trim() },
        company: { name: formData.get('company').trim() || 'Indépendant' },
        customerStatus: formData.get('status'),
      },
      ...current,
    ])
    setIsAddDialogOpen(false)
    event.currentTarget.reset()
  }

  const recentUsers = allUsers.slice(0, 4)

  return (
    <div className="contacts-layout">
      <section className="contacts-main" aria-labelledby="contacts-title">
        <div className="page-heading">
          <div className="heading-copy">
            <span className="heading-icon" aria-hidden="true">♧</span>
            <div>
              <h1 id="contacts-title">Répertoire des contacts</h1>
              <p>Retrouvez rapidement les coordonnées de vos contacts.</p>
            </div>
          </div>
          <button className="primary-button" onClick={() => setIsAddDialogOpen(true)} type="button">
            <span aria-hidden="true">＋</span> Nouveau contact
          </button>
        </div>

        <div className="contact-toolbar">
          <label className="search-field">
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input
              aria-label="Rechercher par nom, e-mail ou téléphone"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un nom, un e-mail, un téléphone…"
              type="search"
              value={search}
            />
          </label>
          <label className="select-field">
            <span className="select-icon" aria-hidden="true">⌖</span>
            <select aria-label="Filtrer par ville" onChange={(event) => setCityFilter(event.target.value)} value={cityFilter}>
              <option value="all">Toutes les villes</option>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <span className="select-chevron" aria-hidden="true">⌄</span>
          </label>
          <label className="select-field sort-field">
            <span className="select-icon" aria-hidden="true">↕</span>
            <select aria-label="Trier les contacts" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="name">Trier par nom</option>
              <option value="city">Trier par ville</option>
              <option value="company">Trier par entreprise</option>
            </select>
            <span className="select-chevron" aria-hidden="true">⌄</span>
          </label>
          <button
            aria-pressed={showFavoritesOnly}
            className={`filter-button${showFavoritesOnly ? ' selected' : ''}`}
            onClick={() => setShowFavoritesOnly((current) => !current)}
            type="button"
          >
            <span aria-hidden="true">★</span> Favoris
          </button>
        </div>

        <div className="results-summary" aria-live="polite">
          <span>
            {loading ? 'Chargement des contacts…' : `${visibleUsers.length} contact${visibleUsers.length === 1 ? '' : 's'}`}
            {!loading && search.trim() && ` trouvé${visibleUsers.length > 1 ? 's' : ''} pour « ${search.trim()} »`}
          </span>
          <span>{allUsers.length} au total</span>
        </div>

        {loading && (
          <div className="state-panel" role="status">
            <span className="loading-spinner" />
            <p>Chargement des contacts…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-panel error-panel" role="alert">
            <span className="state-icon" aria-hidden="true">!</span>
            <p>{error}</p>
            <button className="secondary-button" onClick={() => setRetryCount((count) => count + 1)} type="button">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && visibleUsers.length > 0 && (
          <div className="contact-grid">
            {visibleUsers.map((user, index) => (
              <UserCard
                avatarColor={avatarColors[index % avatarColors.length]}
                isFavorite={favorites.includes(user.id)}
                key={user.id}
                onToggleFavorite={() => toggleFavorite(user.id)}
                onSelect={() => onSelectContact(user)}
                onStartCall={() => onStartCall(user)}
                user={user}
              />
            ))}
          </div>
        )}

        {!loading && !error && visibleUsers.length === 0 && (
          <div className="state-panel empty-panel">
            <span className="state-icon" aria-hidden="true">⌕</span>
            <p>{showFavoritesOnly ? 'Aucun favori pour le moment.' : 'Aucun contact ne correspond à votre recherche.'}</p>
            <button
              className="text-button"
              onClick={() => {
                setSearch('')
                setCityFilter('all')
                setCompanyFilter('all')
                setShowFavoritesOnly(false)
              }}
              type="button"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </section>

      <aside className="insights-column" aria-label="Aperçu des contacts">
        <section className="insight-card groups-card">
          <div className="insight-heading">
            <h2><span aria-hidden="true">♧</span> Entreprises</h2>
            <button className="link-button" type="button">Tout voir</button>
          </div>
          {companies.length ? companies.map(([company, count], index) => (
            <button
              aria-pressed={companyFilter === company}
              className={`company-row${companyFilter === company ? ' company-selected' : ''}`}
              key={company}
              onClick={() => setCompanyFilter((current) => current === company ? 'all' : company)}
              type="button"
            >
              <span className={`company-dot dot-${index}`} />
              <span className="company-name">{company}</span>
              <strong>{count}</strong>
            </button>
          )) : <p className="insight-empty">Les entreprises s’afficheront ici.</p>}
        </section>

        <section className="insight-card stats-card">
          <div className="insight-heading">
            <h2><span aria-hidden="true">▥</span> Vue d’ensemble</h2>
          </div>
          <div className="stat-row"><span className="stat-icon blue-stat">♧</span><span>Contacts</span><strong>{allUsers.length}</strong></div>
          <div className="stat-row"><span className="stat-icon green-stat">⌖</span><span>Villes</span><strong>{cities.length}</strong></div>
          <div className="stat-row"><span className="stat-icon amber-stat">★</span><span>Favoris</span><strong>{favorites.length}</strong></div>
        </section>

        <section className="insight-card recent-card">
          <div className="insight-heading">
            <h2><span aria-hidden="true">◷</span> Contacts récents</h2>
            <button className="link-button" type="button">Tout voir</button>
          </div>
          {recentUsers.length ? recentUsers.map((user, index) => (
          <button className="recent-row recent-contact-button" key={user.id} onClick={() => onSelectContact(user)} type="button">
            <span className={`recent-avatar avatar-${avatarColors[index % avatarColors.length]}`}>{initials(user.name)}</span>
            <span className="recent-person"><strong>{user.name}</strong><span>{user.address.city}</span></span>
          </button>
          )) : <p className="insight-empty">Vos contacts récents apparaîtront ici.</p>}
        </section>
      </aside>

      {isAddDialogOpen && (
        <div className="modal-backdrop">
          <section aria-labelledby="add-contact-title" aria-modal="true" className="contact-dialog" role="dialog">
            <div className="dialog-heading">
              <div>
                <h2 id="add-contact-title">Ajouter un contact</h2>
                <p>Ce contact sera ajouté à votre répertoire local.</p>
              </div>
              <button aria-label="Fermer la fenêtre" className="dialog-close" onClick={() => setIsAddDialogOpen(false)} type="button">×</button>
            </div>
            <form className="contact-form" onSubmit={addContact}>
              <label>Nom complet<input autoFocus name="name" required /></label>
              <label>E-mail<input name="email" required type="email" /></label>
              <label>Téléphone<input name="phone" required type="tel" /></label>
              <label>Ville<input name="city" required /></label>
              <label>Entreprise <span className="optional-label">(facultatif)</span><input name="company" /></label>
              <label>Statut client
                <select defaultValue="Régulier" name="status">
                  <option value="VIP">VIP</option>
                  <option value="Régulier">Régulier</option>
                  <option value="Nouveau client">Nouveau client</option>
                </select>
              </label>
              <div className="dialog-actions">
                <button className="secondary-button" onClick={() => setIsAddDialogOpen(false)} type="button">Annuler</button>
                <button className="primary-button" type="submit">Ajouter</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default UserList
