# Security Headers Configuration

This file documents the security headers configured for LearnHub.

## Headers Configured

### 1. Content-Security-Policy (CSP)
Prevents XSS attacks by controlling which resources can be loaded.

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' data: https: blob:
connect-src 'self' https://*.supabase.co wss://*.supabase.co
```

### 2. X-Frame-Options
Prevents clickjacking attacks.
```
X-Frame-Options: DENY
```

### 3. X-Content-Type-Options
Prevents MIME type sniffing.
```
X-Content-Type-Options: nosniff
```

### 4. X-XSS-Protection
Enables browser's XSS filter.
```
X-XSS-Protection: 1; mode=block
```

### 5. Referrer-Policy
Controls referrer information.
```
Referrer-Policy: strict-origin-when-cross-origin
```

### 6. Permissions-Policy
Disables unused browser features.
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Production Configuration

For production, these headers should be configured at the hosting level:
- **Vercel**: `vercel.json`
- **Netlify**: `netlify.toml` or `_headers` file
- **Nginx**: Server configuration
- **Apache**: `.htaccess` file

## Testing Headers

Test with:
```bash
curl -I http://localhost:8080
```

Or use online tools like:
- https://securityheaders.com
- https://observatory.mozilla.org
