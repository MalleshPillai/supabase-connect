# Auth email templates

Use these HTML templates in **Supabase Dashboard → Authentication → Email Templates**.

## Setup

1. Open your project in [Supabase Dashboard](https://app.supabase.com).
2. Go to **Authentication** → **Email Templates**.
3. For each template type below, paste the contents of `auth-email.html` into the **Body** (or custom HTML if available).
4. Replace the body text as suggested for each type. Supabase uses [Go template](https://pkg.go.dev/html/template) variables.

## Supabase variables

| Variable             | Description                    |
|----------------------|--------------------------------|
| `{{ .ConfirmationURL }}` | Link to confirm / reset / magic link |
| `{{ .Email }}`       | User’s email address           |
| `{{ .SiteURL }}`     | Your site URL from project settings |
| `{{ .Token }}`       | Raw token (usually not needed) |
| `{{ .TokenHash }}`   | Hashed token                   |

## Template types

### Confirm signup

- **Subject:** `Confirm your signup – Precision Script Hub`
- **Body:** Use `auth-email.html` as-is. The default copy is for “confirm your email address”.

### Magic link

- **Subject:** `Your login link – Precision Script Hub`
- In the HTML body, change the main paragraph to:  
  `Click the button below to sign in to your account.`
- Button text: `Sign in to Precision Script Hub`

### Reset password

- **Subject:** `Reset your password – Precision Script Hub`
- In the HTML body, change the main paragraph to:  
  `We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.`
- Button text: `Reset password`

### Change email address

- **Subject:** `Confirm your new email – Precision Script Hub`
- In the HTML body, change the main paragraph to:  
  `Please confirm your new email address by clicking the button below.`
- Button text: `Confirm new email`

## Logo

The template uses `{{ .SiteURL }}/IMG_20250714_213759_672.webp`. Ensure this path is reachable from the internet (e.g. your deployed site URL). If the logo is hosted elsewhere, replace the `src` in the template with the full URL.
