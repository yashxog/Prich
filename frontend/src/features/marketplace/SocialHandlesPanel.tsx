import { useEffect, useState, type FormEvent, type ReactElement } from 'react'
import type { SocialHandle, SocialPlatform } from '@prich/shared'
import { getSocialHandles, saveSocialHandle } from './marketplace.service'

interface SocialHandlesPanelProps {
  role: 'brand' | 'creator'
}

/**
 * Renders profile-owned X and LinkedIn identities without invented platform metrics.
 * @param props - The creator or brand profile namespace.
 * @returns A social profile editor backed by role-specific tables.
 */
export function SocialHandlesPanel({ role }: SocialHandlesPanelProps): ReactElement {
  const [handles, setHandles] = useState<SocialHandle[]>([])
  const [drafts, setDrafts] = useState<Record<SocialPlatform, SocialHandle>>({
    linkedin: { handle: '', platform: 'linkedin', profileUrl: '' },
    x: { handle: '', platform: 'x', profileUrl: '' },
  })
  const [message, setMessage] = useState('')
  const [busyPlatform, setBusyPlatform] = useState<SocialPlatform | null>(null)

  useEffect(() => {
    /**
     * Loads the social identities belonging to the selected role profile.
     * @returns A promise resolved after local form initialization.
     */
    async function loadHandles(): Promise<void> {
      try {
        const loadedHandles = await getSocialHandles(role)
        setHandles(loadedHandles)
        setDrafts((current) => ({
          ...current,
          ...Object.fromEntries(loadedHandles.map((handle) => [handle.platform, handle])),
        }))
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Social profiles could not be loaded.')
      }
    }

    void loadHandles()
  }, [role])

  /**
   * Saves one platform identity to the role-specific profile table.
   * @param event - The social profile form event.
   * @param platform - The platform being updated.
   * @returns A promise resolved after the saved identity is shown.
   */
  async function handleSave(event: FormEvent<HTMLFormElement>, platform: SocialPlatform): Promise<void> {
    event.preventDefault()
    setBusyPlatform(platform)
    setMessage('')

    try {
      const saved = await saveSocialHandle(role, drafts[platform])
      setHandles((current) => [...current.filter((handle) => handle.platform !== platform), saved])
      setMessage(`${platform === 'x' ? 'X' : 'LinkedIn'} profile saved.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The social profile could not be saved.')
    } finally {
      setBusyPlatform(null)
    }
  }

  return <section className="social-panel" aria-labelledby={`${role}-social-title`}>
    <div><p className="eyebrow">Profile connections</p><h2 id={`${role}-social-title`}>Social handles</h2><p>These identities are stored separately for your {role} profile. They do not grant Prich access to platform analytics.</p></div>
    <div className="social-panel__forms">{(['x', 'linkedin'] as const).map((platform) => <form key={platform} onSubmit={(event) => void handleSave(event, platform)}>
      <h3>{platform === 'x' ? 'X' : 'LinkedIn'}</h3>
      <label>Handle<input onChange={(event) => setDrafts((current) => ({ ...current, [platform]: { ...current[platform], handle: event.target.value } }))} placeholder={platform === 'x' ? 'yourhandle' : 'your-profile'} required value={drafts[platform].handle} /></label>
      <label>Profile URL<input onChange={(event) => setDrafts((current) => ({ ...current, [platform]: { ...current[platform], profileUrl: event.target.value } }))} placeholder={platform === 'x' ? 'https://x.com/yourhandle' : 'https://www.linkedin.com/in/your-profile'} required type="url" value={drafts[platform].profileUrl} /></label>
      <button className="button button--secondary" disabled={busyPlatform === platform} type="submit">{busyPlatform === platform ? 'Saving…' : 'Save profile'}</button>
    </form>)}</div>
    {message ? <p className="marketplace-message" role="status">{message}</p> : null}
    {handles.length > 0 ? <p className="social-panel__summary">Connected profiles: {handles.map((handle) => handle.platform === 'x' ? 'X' : 'LinkedIn').join(', ')}</p> : null}
  </section>
}
