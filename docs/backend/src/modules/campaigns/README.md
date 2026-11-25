# Campaign marketplace API

The campaign module owns first-party Prich commissions for original X and LinkedIn posts.

- `GET /api/v1/marketplace/creator` returns open campaigns and only the authenticated creator's submissions.
- `POST /api/v1/marketplace/creator/:campaignId/submissions` accepts a public original-post URL whose host and path match the campaign platform.
- `GET /api/v1/marketplace/brand` returns only campaigns and joined submissions owned by the authenticated brand.
- `POST /api/v1/marketplace/brand/campaigns` creates an open campaign with an exact decimal reward and future deadline.
- `PUT /api/v1/marketplace/brand/submissions/:submissionId` approves or rejects only a submission joined to the authenticated brand's campaign.

All routes use the user ID from the verified Supabase access token. Request bodies and query strings cannot select another owner. Browser database roles have no table or sequence access; only the server repository reads and writes campaign data.

Creator and brand dashboards calculate counts and approved rewards from these stored records. External follower, impression, and engagement metrics are not represented as live data.
