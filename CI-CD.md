# CI/CD Pipeline Documentation

## GitHub Actions Workflow

The CI/CD pipeline automatically runs on:
- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches

## Pipeline Stages

### 1. Test Stage
- Checkout code
- Install dependencies
- Run ESLint
- Run unit tests with Vitest
- Generate coverage report
- Upload coverage to Codecov

### 2. Build Stage
- Runs after tests pass
- Builds the production bundle
- Uploads build artifacts

### 3. Deploy Preview (PRs only)
- Deploys to preview environment for pull requests
- Allows testing before merging

### 4. Deploy Production (main branch only)
- Deploys to production on merge to `main`
- Only runs if all tests pass

## Required Secrets

Add these secrets in GitHub repository settings:

```
VITE_SUPABASE_URL - Your Supabase project URL
VITE_SUPABASE_ANON_KEY - Your Supabase anon key
VERCEL_TOKEN - (Optional) Vercel deployment token
```

## Local Testing

Test the workflow locally with [act](https://github.com/nektos/act):

```bash
# Install act
npm install -g act

# Run workflow
act push
```

## Monitoring

View workflow runs at:
```
https://github.com/YOUR_USERNAME/LearnHub/actions
```

## Troubleshooting

**If tests fail:**
1. Check the Actions tab for error logs
2. Run tests locally: `npm test`
3. Fix failing tests and push again

**If build fails:**
1. Check environment variables are set
2. Test build locally: `npm run build`
3. Verify all dependencies are in package.json
