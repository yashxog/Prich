import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react'
import type { BrandProfile, Campaign, CampaignSubmission, CreateCampaignInput, SubmissionStatus } from '@prich/shared'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../../services/api_client'
import { getBrandProfile, signOutBrand } from '../auth/brand_auth.service'
import { createBrandCampaign, getBrandMarketplace, reviewBrandSubmission } from './marketplace.service'
import { SocialHandlesPanel } from './SocialHandlesPanel'
import './marketplace.css'

interface BrandWorkspaceData {
  campaigns: Campaign[]
  profile: BrandProfile
  submissions: CampaignSubmission[]
}

type WorkspaceState =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { data: BrandWorkspaceData; status: 'ready' }

const EMPTY_CAMPAIGN: CreateCampaignInput = {
  brief: '',
  deadline: '',
  platform: 'x',
  rewardAmount: '',
  title: '',
}

/**
 * Formats an exact campaign reward amount as USD.
 * @param amount - The decimal amount returned by the API.
 * @returns A localized currency string.
 */
function formatReward(amount: string): string {
  return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(Number(amount))
}

/**
 * Renders the brand's campaign creation and commissioned-post review workspace.
 * @returns The authenticated brand workspace.
 */
export function BrandMarketplacePage(): ReactElement {
  const navigate = useNavigate()
  const [state, setState] = useState<WorkspaceState>({ status: 'loading' })
  const [campaignForm, setCampaignForm] = useState<CreateCampaignInput>(EMPTY_CAMPAIGN)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    /**
     * Loads the brand profile and brand-owned marketplace records.
     * @returns A promise resolved after workspace initialization.
     */
    async function loadWorkspace(): Promise<void> {
      try {
        const [profile, marketplace] = await Promise.all([getBrandProfile(), getBrandMarketplace()])

        if (!profile.isComplete) {
          navigate('/brand/onboarding', { replace: true })
          return
        }

        setState({ data: { profile, ...marketplace }, status: 'ready' })
      } catch (error) {
        if (
          (error instanceof ApiRequestError && error.status === 401)
          || (error instanceof Error && /session|expired|log in/i.test(error.message))
        ) {
          navigate('/brand/login', { replace: true })
          return
        }

        setState({ message: error instanceof Error ? error.message : 'Your brand workspace could not be loaded.', status: 'error' })
      }
    }

    void loadWorkspace()
  }, [navigate])

  const analytics = useMemo(() => {
    const submissions = state.status === 'ready' ? state.data.submissions : []
    return {
      approved: submissions.filter((submission) => submission.status === 'approved').length,
      pending: submissions.filter((submission) => submission.status === 'pending').length,
      received: submissions.length,
    }
  }, [state])

  /**
   * Creates a new open campaign from the brand form.
   * @param event - The campaign form submission event.
   * @returns A promise resolved after the new campaign is shown.
   */
  async function handleCreateCampaign(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setBusyId('campaign')
    setMessage('')

    try {
      const campaign = await createBrandCampaign(campaignForm)
      setState((current) => current.status === 'ready'
        ? { data: { ...current.data, campaigns: [...current.data.campaigns, campaign] }, status: 'ready' }
        : current)
      setCampaignForm(EMPTY_CAMPAIGN)
      setMessage('Campaign published to the creator marketplace.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The campaign could not be created.')
    } finally {
      setBusyId(null)
    }
  }

  /**
   * Applies an approval decision to a brand-owned submission.
   * @param submissionId - The reviewed submission ID.
   * @param status - The approval or rejection decision.
   * @returns A promise resolved after the local row is updated.
   */
  async function handleReview(
    submissionId: string,
    status: Extract<SubmissionStatus, 'approved' | 'rejected'>,
  ): Promise<void> {
    setBusyId(submissionId)
    setMessage('')

    try {
      const updated = await reviewBrandSubmission(submissionId, { feedback: feedback[submissionId] ?? '', status })
      setState((current) => current.status === 'ready'
        ? { data: { ...current.data, submissions: current.data.submissions.map((item) => item.id === updated.id ? updated : item) }, status: 'ready' }
        : current)
      setMessage(`Submission ${status}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The review could not be saved.')
    } finally {
      setBusyId(null)
    }
  }

  /**
   * Ends the active brand session.
   * @returns A promise resolved after returning to login.
   */
  async function handleSignOut(): Promise<void> {
    await signOutBrand()
    navigate('/brand/login', { replace: true })
  }

  if (state.status !== 'ready') {
    return <main className="marketplace-loading" role={state.status === 'error' ? 'alert' : 'status'}><h1>{state.status === 'error' ? 'Workspace unavailable' : 'Loading brand workspace'}</h1>{state.status === 'error' ? <p>{state.message}</p> : null}</main>
  }

  const { campaigns, profile, submissions } = state.data

  return <main className="marketplace-shell">
    <header className="marketplace-header"><a className="wordmark" href="/"><span aria-hidden="true" className="wordmark__mark">P</span><span>Prich</span></a><div><span className="marketplace-user">{profile.companyName}</span><button className="button button--secondary" onClick={handleSignOut} type="button">Log out</button></div></header>
    <section className="marketplace-hero"><div><p className="eyebrow">Brand workspace</p><h1>Commission posts. Review the work.</h1><p>Every number below comes from campaigns and creator submissions recorded in Prich.</p></div><div className="marketplace-stats" aria-label="Brand content analytics"><div><span>Posts received</span><strong>{analytics.received}</strong></div><div><span>Awaiting review</span><strong>{analytics.pending}</strong></div><div><span>Approved</span><strong>{analytics.approved}</strong></div></div></section>
    <div className="marketplace-grid">
      <section aria-labelledby="campaign-builder"><h2 id="campaign-builder">Create campaign</h2><form className="campaign-builder" onSubmit={(event) => void handleCreateCampaign(event)}>
        <label>Campaign title<input maxLength={160} onChange={(event) => setCampaignForm((current) => ({ ...current, title: event.target.value }))} required value={campaignForm.title} /></label>
        <label>Brief<textarea maxLength={2000} onChange={(event) => setCampaignForm((current) => ({ ...current, brief: event.target.value }))} required rows={4} value={campaignForm.brief} /></label>
        <div className="campaign-builder__split"><label>Platform<select onChange={(event) => setCampaignForm((current) => ({ ...current, platform: event.target.value as 'linkedin' | 'x' }))} value={campaignForm.platform}><option value="x">X</option><option value="linkedin">LinkedIn</option></select></label><label>Reward (USD)<input min="0.01" onChange={(event) => setCampaignForm((current) => ({ ...current, rewardAmount: event.target.value }))} required step="0.01" type="number" value={campaignForm.rewardAmount} /></label></div>
        <label>Submission deadline<input onChange={(event) => setCampaignForm((current) => ({ ...current, deadline: event.target.value ? new Date(event.target.value).toISOString() : '' }))} required type="datetime-local" /></label>
        <button className="button button--primary" disabled={busyId === 'campaign'} type="submit">{busyId === 'campaign' ? 'Publishing…' : 'Publish campaign'}</button>
      </form>{message ? <p className="marketplace-message" role="status">{message}</p> : null}
        <div className="campaign-list campaign-list--compact">{campaigns.map((campaign) => <article className="campaign-card" key={campaign.id}><div className="campaign-card__meta"><span className="status-chip">{campaign.platform === 'x' ? 'X' : 'LinkedIn'}</span><strong>{formatReward(campaign.rewardAmount)}</strong></div><h3>{campaign.title}</h3><small>{campaign.status} · due {new Date(campaign.deadline).toLocaleDateString()}</small></article>)}</div>
      </section>
      <section aria-labelledby="commissioned-posts"><h2 id="commissioned-posts">Commissioned posts</h2>{submissions.length === 0 ? <div className="marketplace-empty"><h3>No posts yet</h3><p>Creator submissions for your campaigns will appear here.</p></div> : <div className="submission-list">{submissions.map((submission) => <article className="submission-row submission-row--review" key={submission.id}><div><span className={`status-chip status-chip--${submission.status}`}>{submission.status}</span><h3>{submission.campaignTitle}</h3><a href={submission.postUrl} rel="noreferrer" target="_blank">Open original post</a><label htmlFor={`feedback-${submission.id}`}>Private review note</label><textarea id={`feedback-${submission.id}`} maxLength={1000} onChange={(event) => setFeedback((current) => ({ ...current, [submission.id]: event.target.value }))} rows={2} value={feedback[submission.id] ?? submission.brandFeedback} /></div><div className="review-actions"><strong>{formatReward(submission.rewardAmount)}</strong><button className="button button--primary" disabled={busyId === submission.id} onClick={() => void handleReview(submission.id, 'approved')} type="button">Approve</button><button className="button button--secondary" disabled={busyId === submission.id} onClick={() => void handleReview(submission.id, 'rejected')} type="button">Reject</button></div></article>)}</div>}</section>
    </div>
    <SocialHandlesPanel role="brand" />
  </main>
}
