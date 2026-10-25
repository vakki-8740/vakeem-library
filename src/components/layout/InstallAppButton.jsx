import { useEffect, useState } from 'react'
import { Icon } from '../ui/icons/Icons.jsx'
import './InstallAppButton.css'

function isInstalled() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function installHelp() {
  const ua = window.navigator.userAgent || ''
  const isAppleMobile = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1)

  if (isAppleMobile) {
    return {
      title: 'Add to your iPhone or iPad',
      steps: [
        'Open this page in Safari.',
        'Tap the Share button at the bottom of the screen (or at the top on iPad).',
        'Choose “Add to Home Screen”, then tap “Add”.',
      ],
    }
  }

  if (/Android/i.test(ua)) {
    return {
      title: 'Add to your Android phone',
      steps: [
        'Open this page in Chrome.',
        'Tap the three-dot menu in the top corner.',
        'Choose “Install app” or “Add to Home screen”, then confirm.',
      ],
    }
  }

  return {
    title: 'Install OWN Library',
    steps: [
      'Open this page in your browser.',
      'Open the browser menu and choose “Install app” or “Add to Home Screen”.',
      'Follow the prompt to add OWN Library to your device.',
    ],
  }
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setInstalled(isInstalled())

    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setShowHelp(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowHelp(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (installed) return null

  const onInstall = async () => {
    if (!installPrompt) {
      setShowHelp(true)
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    if (choice?.outcome === 'accepted') setInstalled(true)
  }

  const help = showHelp ? installHelp() : null

  return (
    <>
      <button
        type="button"
        className="install-app__trigger"
        onClick={onInstall}
        aria-label="Install OWN Library on this device"
        title="Install OWN Library"
      >
        <Icon name="download" size={17} />
        <span>Install</span>
      </button>

      {showHelp && (
        <div className="install-app__backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowHelp(false)
        }}>
          <section
            className="install-app__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
          >
            <button
              type="button"
              className="install-app__close"
              onClick={() => setShowHelp(false)}
              aria-label="Close install instructions"
            >
              <Icon name="x" size={18} />
            </button>
            <span className="install-app__badge"><Icon name="download" size={20} /></span>
            <h2 id="install-app-title">{help.title}</h2>
            <ol>
              {help.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <p>Your favorites and theme stay saved on this device.</p>
            <button type="button" className="install-app__done" onClick={() => setShowHelp(false)}>
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  )
}
