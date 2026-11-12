import { useState } from 'react'

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function MessageCenter({ contacts, selectedContact }) {
  const [selectedId, setSelectedId] = useState(selectedContact ? String(selectedContact.id) : '')
  const [conversations, setConversations] = useState({})
  const [search, setSearch] = useState('')
  const selected = contacts.find((contact) => String(contact.id) === selectedId)
    ?? contacts.find((contact) => contact.id === selectedContact?.id)
    ?? contacts[0]
  const messages = selected ? conversations[selected.id] ?? [] : []
  const visibleContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))

  function sendMessage(event) {
    event.preventDefault()
    if (!selected) return
    const form = event.currentTarget
    const text = new FormData(form).get('message').trim()
    if (!text) return
    setConversations((current) => ({
      ...current,
      [selected.id]: [...(current[selected.id] ?? []), { id: `${Date.now()}`, text, createdAt: Date.now() }],
    }))
    form.reset()
  }

  return (
    <div className="workspace-page messages-page">
      <div className="page-heading">
        <div><span className="eyebrow">VOTRE MESSAGERIE</span><h1>Espace messages</h1><p>Retrouvez et suivez vos échanges avec vos contacts.</p></div>
        <span className="service-pill"><i /> Messagerie active</span>
      </div>
      <section className="message-workspace">
        <aside className="message-contact-list">
          <div className="message-list-heading"><h2>Conversations</h2><span>{contacts.length}</span></div>
          <label className="message-search"><span aria-hidden="true">⌕</span><input aria-label="Rechercher un contact" onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un contact…" value={search} /></label>
          <div className="message-contacts">
            {visibleContacts.map((contact, index) => (
              <button className={`message-contact${selected?.id === contact.id ? ' selected' : ''}`} key={contact.id} onClick={() => setSelectedId(String(contact.id))} type="button">
                <span className={`recent-avatar avatar-${['blue', 'green', 'purple', 'orange', 'pink', 'teal'][index % 6]}`}>{initials(contact.name)}</span>
                <span className="message-contact-copy"><strong>{contact.name}</strong><small>{contact.company.name}</small></span>
                {conversations[contact.id]?.length > 0 && <span className="message-unread-dot" />}
              </button>
            ))}
            {!visibleContacts.length && <p className="message-list-empty">Aucun contact trouvé.</p>}
          </div>
        </aside>

        <section className="message-thread">
          {selected ? (
            <>
              <header className="thread-header">
                <span className="recent-avatar avatar-blue">{initials(selected.name)}</span>
                <div><strong>{selected.name}</strong><small>{selected.company.name} · {selected.address.city}</small></div>
                <span className="thread-contact-tag">Contact</span>
              </header>
              <div className="thread-messages" aria-live="polite">
                {!messages.length ? (
                  <div className="thread-empty"><span className="thread-empty-icon">✉</span><strong>La conversation commence ici</strong><p>Écrivez un premier message à {selected.name}.</p></div>
                ) : (
                  <>
                    <div className="thread-day-divider"><span>Aujourd’hui</span></div>
                    {messages.map((message) => (
                      <article className="message-bubble-wrap outgoing" key={message.id}>
                        <div className="message-bubble">{message.text}</div>
                        <time>{new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(message.createdAt)}</time>
                      </article>
                    ))}
                  </>
                )}
              </div>
              <form className="message-composer" onSubmit={sendMessage}>
                <label className="visually-hidden" htmlFor="message-input">Votre message</label>
                <input autoComplete="off" id="message-input" name="message" placeholder={`Écrire à ${selected.name}…`} required />
                <button aria-label="Envoyer le message" className="send-message-button" type="submit">Envoyer <span>↗</span></button>
              </form>
              <div className="message-disclaimer">Gardez le fil de vos conversations avec vos contacts.</div>
            </>
          ) : <div className="thread-empty"><span className="thread-empty-icon">✉</span><strong>Chargement de vos contacts…</strong></div>}
        </section>
      </section>
    </div>
  )
}

export default MessageCenter
