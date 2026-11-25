# Dual-role identity and first-party marketplace data

## Decision

A single Supabase Auth identity may own both a creator profile and a brand profile. `account_roles` therefore uses `(user_id, account_type)` as its primary key, and claiming a role is an idempotent insert for that pair.

Creator and brand social handles remain in separate tables because they describe different marketplace actors even when one person operates both. Campaigns belong to brand user IDs, and post submissions belong to creator user IDs and a campaign.

## Security boundary

The backend verifies the access token and supplies every owner ID. Brand submission reads and reviews join through the brand-owned campaign rather than trusting a brand, creator, or campaign owner supplied by the browser. All new public-schema tables have RLS enabled, browser grants revoked, and server-only service-role access.

## Analytics boundary

Dashboard totals are computed only from Prich campaigns and submissions. Social handles are identity records, not proof of API authorization. External platform metrics remain explicitly unavailable until first-party API integrations are implemented.
