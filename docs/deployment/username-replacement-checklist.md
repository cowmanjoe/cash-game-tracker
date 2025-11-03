# GitHub Username Replacement Checklist

The following files contain `YOUR_USERNAME` placeholders that must be replaced with your actual GitHub username before deployment.

## Files to Update

- [ ] `.github/workflows/deploy.yml` - Lines with `ghcr.io/YOUR_USERNAME/`
- [ ] `docker-compose.prod.yml` - Image references for server and web

## How to Replace

### Option 1: Manual Find and Replace

```bash
# Find all occurrences
grep -r "YOUR_USERNAME" .github/ docker-compose.prod.yml

# Replace with your username (e.g., 'johndoe')
sed -i 's/YOUR_USERNAME/johndoe/g' .github/workflows/deploy.yml
sed -i 's/YOUR_USERNAME/johndoe/g' docker-compose.prod.yml
```

### Option 2: Use IDE Find and Replace

1. Open project in your IDE
2. Find and Replace All (Ctrl+Shift+H or Cmd+Shift+H)
3. Find: `YOUR_USERNAME`
4. Replace: Your GitHub username
5. Replace in: `.github/workflows/deploy.yml` and `docker-compose.prod.yml`

## Verification

After replacement:

```bash
# Should return no results
grep -r "YOUR_USERNAME" .github/ docker-compose.prod.yml

# Should show your username
grep "ghcr.io" .github/workflows/deploy.yml docker-compose.prod.yml
```

## Commit Changes

```bash
git add .github/workflows/deploy.yml docker-compose.prod.yml
git commit -m "chore: replace GitHub username placeholders"
```
