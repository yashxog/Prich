import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react'
import type { Campaign, CampaignSubmission, CreatorProfile } from '@prich/shared'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../../services/api_client'
import { getCreatorProfile, signOutCreator } from '../auth/auth.service'
import { getCreatorMarketplace, submitCampaignPost } from './marketplace.service'
import { SocialHandlesPanel } from './SocialHandlesPanel'
import './marketplace.css'

interface CreatorWorkspaceData {
  campaigns: Campaign[]
  profile: CreatorProfile
  submissions: CampaignSubmission[]
}

type WorkspaceState =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { data: CreatorWorkspaceData; status: 'ready' }

/**
 * Formats a numeric reward amount for display without implying a payout currency conversion.
 * @param amount - The exact decimal reward amount returned by the API.
 * @returns A compact USD display string.
 */
function formatReward(amount: string): string {
  return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(Number(amount))
}

/**
 * Renders the creator campaign marketplace and first-party submission analytics.
 * @returns The authenticated creator workspace.
 */
export function CreatorMarketplacePage(): ReactElement {
  const navigate = useNavigate()
  const [state, setState] = useState<WorkspaceState>({ status: 'loading' })
  const [postUrls, setPostUrls] = useState<Record<string, string>>({})
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => {
    /**
     * Loads the profile and marketplace through authenticated entry points.
     * @returns A promise resolved after workspace initialization.
     */
    async function loadWorkspace(): Promise<void> {
      try {
        const [profile, marketplace] = await Promise.all([getCreatorProfile(), getCreatorMarketplace()])

        if (!profile.isComplete) {
          navigate('/creator/onboarding', { replace: true })
          return
        }

        setState({ data: { profile, ...marketplace }, status: 'ready' })
      } catch (error) {
        if (
          (error instanceof ApiRequestError && error.status === 401)
          || (error instanceof Error && /session|expired|log in/i.test(error.message))
        ) {
          navigate('/creator/login', { replace: true })
          return
        }

        setState({
          message: error instanceof Error ? error.message : 'Your creator workspace could not be loaded.',
          status: 'error',
        })
      }
    }

    void loadWorkspace()
  }, [navigate])

  const analytics = useMemo(() => {
    const submissions = state.status === 'ready' ? state.data.submissions : []
    return {
      approved: submissions.filter((submission) => submission.status === 'approved').length,
      earned: submissions
        .filter((submission) => submission.status === 'approved')
        .reduce((total, submission) => total + Number(submission.rewardAmount), 0),
      submitted: submissions.length,
    }
  }, [state])

  /**
   * Submits one campaign post and refreshes the local submission list.
   * @param event - The campaign submission form event.
   * @param campaign - The campaign receiving the post.
   * @returns A promise resolved after the API response is applied.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>, campaign: Campaign): Promise<void> {
    event.preventDefault()
    setActiveCampaignId(campaign.id)
    setFormMessage('')

    try {
      const submission = await submitCampaignPost(campaign.id, campaign.platform, postUrls[campaign.id] ?? '')
      setState((current) => current.status === 'ready'
        ? { data: { ...current.data, submissions: [submission, ...current.data.submissions] }, status: 'ready' }
        : current)
      setPostUrls((current) => ({ ...current, [campaign.id]: '' }))
      setFormMessage('Post submitted for brand review.')
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'The post could not be submitted.')
    } finally {
      setActiveCampaignId(null)
    }
  }

  /**
   * Ends the active creator session.
   * @returns A promise resolved after returning to login.
   */
  async function handleSignOut(): Promise<void> {
    await signOutCreator()
    navigate('/creator/login', { replace: true })
  }

  if (state.status !== 'ready') {
    return <main className="marketplace-loading" role={state.status === 'error' ? 'alert' : 'status'}>
      <h1>{state.status === 'error' ? 'Workspace unavailable' : 'Loading creator workspace'}</h1>
      {state.status === 'error' ? <p>{state.message}</p> : null}
    </main>
  }

  const { campaigns, profile, submissions } = state.data

  return <main className="marketplace-shell">
    <header className="marketplace-header">
      <a className="wordmark" href="/"><span aria-hidden="true" className="wordmark__mark">P</span><span>Prich</span></a>
      <div><span className="marketplace-user">{profile.displayName}</span><button className="button button--secondary" onClick={handleSignOut} type="button">Log out</button></div>
    </header>
    <section className="marketplace-hero">
      <div><p className="eyebrow">Creator workspace</p><h1>Original posts, clear rewards.</h1><p>Submit your own X or LinkedIn post to an open campaign. Prich reports only campaign activity recorded here.</p></div>
      <div className="marketplace-stats" aria-label="Creator campaign analytics">
        <div><span>Submitted</span><strong>{analytics.submitted}</strong></div>
        <div><span>Approved</span><strong>{analytics.approved}</strong></div>
        <div><span>Approved rewards</span><strong>{formatReward(String(analytics.earned))}</strong></div>
      </div>
    </section>
    <div className="marketplace-grid">
      <section aria-labelledby="open-campaigns"><h2 id="open-campaigns">Open campaigns</h2>
        {campaigns.length === 0 ? <div className="marketplace-empty"><h3>No open campaigns</h3><p>New brand commissions will appear here.</p></div> : null}
        <div className="campaign-list">{campaigns.map((campaign) => <article className="campaign-card" key={campaign.id}>
          <div className="campaign-card__meta"><span className="status-chip">{campaign.platform === 'x' ? 'X' : 'LinkedIn'}</span><strong>{formatReward(campaign.rewardAmount)}</strong></div>
          <h3>{campaign.title}</h3><p>{campaign.brief}</p><small>Submit by {new Date(campaign.deadline).toLocaleDateString()}</small>
          <form onSubmit={(event) => void handleSubmit(event, campaign)}><label htmlFor={`post-${campaign.id}`}>Original post URL</label><input id={`post-${campaign.id}`} onChange={(event) => setPostUrls((current) => ({ ...current, [campaign.id]: event.target.value }))} placeholder={campaign.platform === 'x' ? 'https://x.com/you/status/…' : 'https://www.linkedin.com/posts/…'} required type="url" value={postUrls[campaign.id] ?? ''} /><button className="button button--primary" disabled={activeCampaignId === campaign.id} type="submit">{activeCampaignId === campaign.id ? 'Submitting…' : 'Submit post'}</button></form>
        </article>)}</div>
      </section>
      <section aria-labelledby="creator-activity"><h2 id="creator-activity">Your submissions</h2>
        {formMessage ? <p className="marketplace-message" role="status">{formMessage}</p> : null}
        {submissions.length === 0 ? <div className="marketplace-empty"><h3>No posts submitted</h3><p>Choose an open campaign to start.</p></div> : <div className="submission-list">{submissions.map((submission) => <article className="submission-row" key={submission.id}><div><span className={`status-chip status-chip--${submission.status}`}>{submission.status}</span><h3>{submission.campaignTitle}</h3><a href={submission.postUrl} rel="noreferrer" target="_blank">View submitted post</a>{submission.brandFeedback ? <p>Brand note: {submission.brandFeedback}</p> : null}</div><strong>{formatReward(submission.rewardAmount)}</strong></article>)}</div>}
        <aside className="data-note"><strong>Social analytics connection</strong><p>Follower, impression, and engagement metrics are unavailable until an authorized first-party X or LinkedIn integration is connected. They are not estimated here.</p></aside>
      </section>
    </div>
    <SocialHandlesPanel role="creator" />
  </main>
}
