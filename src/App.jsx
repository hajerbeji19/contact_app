import { useEffect, useState } from 'react'
import UserList from './components/UserList.jsx'
import Dashboard from './components/Dashboard.jsx'
import CustomerProfile from './components/CustomerProfile.jsx'
import CallSimulator from './components/CallSimulator.jsx'
import MessageCenter from './components/MessageCenter.jsx'
import './App.css'

const navigation = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'contacts', label: 'Contacts', icon: 'contacts' },
  { id: 'calls', label: 'Appels', icon: 'calls' },
  { id: 'messages', label: 'Messages', icon: 'messages' },
]

const pageTitles = {
  dashboard: 'Vue d’ensemble de votre activité',
  contacts: 'Votre répertoire de contacts',
  profile: 'Fiche client',
  calls: 'Espace appels',
  messages: 'Espace messages',
}

function Icon({ name, size = 20 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    contacts: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calls: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.2 2 2 0 0 1 4.1 1h3a2 2 0 0 1 2 1.7l.5 3.2a2 2 0 0 1-.6 1.7L7.1 9.5a16 16 0 0 0 7.4 7.4l1.9-1.9a2 2 0 0 1 1.7-.6l3.2.5a2 2 0 0 1 1.7 2z" />,
    messages: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /><path d="M8 11h8M8 14h5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [notes, setNotes] = useState({})
  const [callLogs, setCallLogs] = useState([])
  const [activeCall, setActiveCall] = useState(null)
  const [lastCall, setLastCall] = useState(null)

  useEffect(() => {
    if (!activeCall || activeCall.status !== 'Calling') return undefined

    const timeout = window.setTimeout(() => {
      setActiveCall((current) => (
        current?.id === activeCall.id ? { ...current, status: 'In Progress' } : current
      ))
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [activeCall])

  function openProfile(contact) {
    setSelectedContact(contact)
    setPage('profile')
  }

  function startCall(contact) {
    const call = {
      id: `${contact.id}-${Date.now()}`,
      contact,
      startedAt: Date.now(),
      status: 'Calling',
      muted: false,
    }
    setSelectedContact(contact)
    setActiveCall(call)
    setPage('calls')
  }

  function toggleMute() {
    setActiveCall((current) => current ? { ...current, muted: !current.muted } : current)
  }

  function endCall() {
    if (!activeCall) return

    const completedCall = {
      ...activeCall,
      status: 'Completed',
      endedAt: Date.now(),
      duration: Math.max(1, Math.floor((Date.now() - activeCall.startedAt) / 1000)),
    }
    setCallLogs((current) => [completedCall, ...current])
    setLastCall(completedCall)
    setActiveCall(null)
  }

  function addNote(contactId, text) {
    const note = { id: `${Date.now()}`, text, createdAt: Date.now() }
    setNotes((current) => ({
      ...current,
      [contactId]: [note, ...(current[contactId] ?? [])],
    }))
  }

  function showPage(nextPage) {
    setPage(nextPage)
  }

  const activePage = page === 'profile' ? 'contacts' : page

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" aria-label="Kallemni">
          <span className="brand-mark"><Icon name="calls" size={22} /></span>
          <span>Kallemni</span>
        </div>

        <div className="nav-caption">ESPACE DE TRAVAIL</div>
        <nav className="primary-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <button
              aria-current={activePage === item.id ? 'page' : undefined}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              key={item.id}
              onClick={() => showPage(item.id)}
              type="button"
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'calls' && activeCall && <span className="nav-live-dot" aria-label="Appel en cours" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="agent-card">
          <span className="profile-avatar">HB</span>
          <span className="agent-info"><strong>Hajer Beji</strong><small>Conseillère clientèle</small></span>
          <span className="agent-status" title="En ligne" />
        </div>
        <div className="sidebar-note">Une conversation à la fois.<br />Un client au cœur de chaque échange.</div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="welcome">
            <span className="sun-icon" aria-hidden="true">✦</span>
            <div>
              <strong>Bonjour, Hajer</strong>
              <span>{pageTitles[page]}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="workspace-status"><span /> Centre d’appels actif</span>
            <button className="profile-button" onClick={() => setPage('dashboard')} type="button">
              <span className="profile-avatar">HB</span>
              <span>Hajer Beji</span>
              <Icon name="chevron" size={14} />
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <div hidden={page !== 'dashboard'}>
            <Dashboard contacts={contacts} callLogs={callLogs} activeCall={activeCall} onOpenProfile={openProfile} onNavigate={showPage} />
          </div>
          <div hidden={page !== 'contacts'}>
            <UserList onContactsChange={setContacts} onSelectContact={openProfile} onStartCall={startCall} />
          </div>
          <div hidden={page !== 'profile'}>
            {selectedContact && (
              <CustomerProfile
                contact={selectedContact}
                notes={notes[selectedContact.id] ?? []}
                calls={callLogs.filter((call) => call.contact.id === selectedContact.id)}
                onBack={() => setPage('contacts')}
                onAddNote={(text) => addNote(selectedContact.id, text)}
                onStartCall={() => startCall(selectedContact)}
              />
            )}
          </div>
          <div hidden={page !== 'calls'}>
            <CallSimulator
              contacts={contacts}
              activeCall={activeCall}
              lastCall={lastCall}
              onStartCall={startCall}
              onToggleMute={toggleMute}
              onEndCall={endCall}
              onOpenProfile={openProfile}
            />
          </div>
          <div hidden={page !== 'messages'}>
            <MessageCenter contacts={contacts} selectedContact={selectedContact} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
