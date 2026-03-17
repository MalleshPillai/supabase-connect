# Google sign-in (Supabase)

1. **Supabase Dashboard** → **Authentication** → **Providers** → enable **Google** and add Client ID / Secret from [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Web client).

2. **Redirect URLs** (Authentication → URL Configuration):
   - Add your site URLs, e.g.  
     `http://localhost:5173/auth`  
     `https://your-domain.com/auth`  
   - For “Continue with Google” from the **order** page, also add each order URL pattern you use, e.g.  
     `http://localhost:5173/order/*`  
     or list paths like `http://localhost:5173/order/paper-projects`.

3. **Site URL** in Supabase should match your app origin (e.g. `http://localhost:5173` in dev).

Without these, Google OAuth will fail after redirect.
