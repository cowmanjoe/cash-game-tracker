# GitHub Actions Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate building and deploying both server and web containers to GCP VM (35.212.245.190) via GitHub Actions when code is pushed to main branch.

**Architecture:** Single GitHub Actions workflow that runs tests, builds Docker images, pushes to GitHub Container Registry (ghcr.io), then SSHs to GCP VM to deploy using docker-compose. Separate docker-compose.prod.yml for production deployment (keeps local dev workflow intact).

**Tech Stack:** GitHub Actions, Docker, GitHub Container Registry, SSH, docker-compose, Gradle (server), npm (web)

---

## Task 1: Create GitHub Actions Workflow Directory

**Files:**
- Create: `.github/workflows/` (directory)

**Step 1: Create .github/workflows directory**

```bash
mkdir -p .github/workflows
```

**Step 2: Verify directory created**

Run: `ls -la .github/`
Expected: Should see `workflows` directory

**Step 3: Commit**

```bash
git add .github/workflows/.gitkeep
git commit -m "chore: create GitHub Actions workflow directory"
```

Note: Git doesn't track empty directories, so we'll add the workflow file in the next task.

---

## Task 2: Create Production Docker Compose File

**Files:**
- Create: `docker-compose.prod.yml`

**Step 1: Create docker-compose.prod.yml**

Create file at repository root with this exact content (replace `YOUR_USERNAME` with actual GitHub username):

```yaml
version: '3.8'

services:
  # Backend API server
  server:
    image: ghcr.io/YOUR_USERNAME/cash-game-tracker-server:latest
    container_name: cash-game-tracker-server
    ports:
      - "8080:8080"
    env_file:
      - .env
    restart: unless-stopped
    networks:
      - cash-game-tracker-network

  # Frontend web application
  web:
    image: ghcr.io/YOUR_USERNAME/cash-game-tracker-web:latest
    container_name: cash-game-tracker-web
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - cash-game-tracker-network

networks:
  cash-game-tracker-network:
    driver: bridge
```

**Step 2: Verify file created**

Run: `cat docker-compose.prod.yml`
Expected: Should see the yaml content with ghcr.io image references

**Step 3: Verify YAML syntax**

Run: `docker-compose -f docker-compose.prod.yml config`
Expected: Should output parsed config without errors (images won't exist yet, that's OK)

**Step 4: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "feat: add production docker-compose configuration

- References ghcr.io images instead of building locally
- Uses .env file for environment variables
- Separates production config from local dev workflow"
```

---

## Task 3: Create GitHub Actions Workflow - Part 1 (Scaffold)

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create workflow file with basic structure**

Create `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to GCP VM

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
```

**Step 2: Verify YAML syntax**

Run: `cat .github/workflows/deploy.yml`
Expected: Should see valid YAML with name, on, jobs sections

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions workflow scaffold

Basic workflow structure that triggers on push to main"
```

---

## Task 4: Add Server Test Steps to Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add Java setup and server test steps**

Add these steps after the checkout step:

```yaml
      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant execute permission for gradlew
        run: chmod +x cash-game-tracker-server/gradlew

      - name: Run server tests
        run: |
          cd cash-game-tracker-server
          ./gradlew test --no-daemon
```

**Step 2: Verify YAML syntax**

Run: `cat .github/workflows/deploy.yml | grep -A 5 "Set up Java"`
Expected: Should see Java setup and test steps properly indented

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add server test steps to workflow

- Set up Java 17 with Gradle caching
- Run server tests before deployment"
```

---

## Task 5: Add Web Test Steps to Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add Node.js setup and web test steps**

Add these steps after the server test steps:

```yaml
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: cash-game-tracker-web/package-lock.json

      - name: Install web dependencies
        run: |
          cd cash-game-tracker-web
          npm ci

      - name: Build web application
        run: |
          cd cash-game-tracker-web
          npm run build
```

Note: Using `npm run build` instead of tests since the web app doesn't have a test script configured yet. Build will catch compilation/bundling errors.

**Step 2: Verify YAML syntax**

Run: `cat .github/workflows/deploy.yml | grep -A 5 "Set up Node"`
Expected: Should see Node setup and build steps properly indented

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add web build steps to workflow

- Set up Node.js 20 with npm caching
- Install dependencies and build web app
- Build step catches compilation errors before deployment"
```

---

## Task 6: Add Docker Image Build Steps to Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add GHCR login and image build steps**

Add these steps after the web build steps (replace YOUR_USERNAME):

```yaml
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push server image
        run: |
          cd cash-game-tracker-server
          docker build -t ghcr.io/YOUR_USERNAME/cash-game-tracker-server:latest .
          docker push ghcr.io/YOUR_USERNAME/cash-game-tracker-server:latest

      - name: Build and push web image
        run: |
          cd cash-game-tracker-web
          docker build -t ghcr.io/YOUR_USERNAME/cash-game-tracker-web:latest .
          docker push ghcr.io/YOUR_USERNAME/cash-game-tracker-web:latest
```

**Step 2: Verify YAML syntax and image references**

Run: `cat .github/workflows/deploy.yml | grep "ghcr.io"`
Expected: Should see consistent image references matching docker-compose.prod.yml

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add Docker image build and push steps

- Login to GitHub Container Registry
- Build server and web images
- Push to ghcr.io for deployment"
```

---

## Task 7: Add SSH Deployment Steps to Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add SSH deployment steps**

Add these steps after the image push steps:

```yaml
      - name: Deploy to GCP VM
        uses: appleboy/ssh-action@v1.0.0
        env:
          SPRING_PROFILES_ACTIVE: ${{ secrets.SPRING_PROFILES_ACTIVE }}
          BACKEND_API_URL: ${{ secrets.BACKEND_API_URL }}
          SECURE_COOKIES: ${{ secrets.SECURE_COOKIES }}
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          envs: SPRING_PROFILES_ACTIVE,BACKEND_API_URL,SECURE_COOKIES
          script: |
            # Navigate to deployment directory
            cd ~/cash-game-tracker

            # Write environment variables to .env file
            cat > .env << EOF
            SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
            BACKEND_API_URL=${BACKEND_API_URL}
            SECURE_COOKIES=${SECURE_COOKIES}
            EOF

            # Login to GitHub Container Registry
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # Pull latest images
            docker-compose -f docker-compose.prod.yml pull

            # Restart containers with new images
            docker-compose -f docker-compose.prod.yml up -d

            # Cleanup old images
            docker image prune -f
```

**Step 2: Verify YAML syntax and SSH action configuration**

Run: `cat .github/workflows/deploy.yml | grep -A 20 "Deploy to GCP"`
Expected: Should see SSH action with host, username, key, script sections properly configured

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add SSH deployment to GCP VM

- Use appleboy/ssh-action to connect to VM
- Write environment variables from secrets to .env
- Pull latest images and restart containers
- Cleanup old images to save disk space"
```

---

## Task 8: Create Setup Documentation

**Files:**
- Create: `docs/deployment/github-actions-setup.md`

**Step 1: Create deployment docs directory**

```bash
mkdir -p docs/deployment
```

**Step 2: Create setup documentation**

Create `docs/deployment/github-actions-setup.md` with:

```markdown
# GitHub Actions Deployment Setup

This document describes the one-time setup required for the GitHub Actions CI/CD pipeline.

## Prerequisites

- GitHub repository with Actions enabled
- GCP VM running at 35.212.245.190
- Docker and docker-compose installed on VM
- SSH access to VM

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

### SSH Configuration
- `SSH_PRIVATE_KEY` - Private SSH key for accessing the VM
- `VM_USER` - Username on the GCP VM (e.g., `cowan`)
- `VM_HOST` - `35.212.245.190`

### Application Environment Variables
- `SPRING_PROFILES_ACTIVE` - `prod`
- `BACKEND_API_URL` - `http://server:8080`
- `SECURE_COOKIES` - `true`

## SSH Key Setup

### 1. Generate SSH Key Pair

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
```

This creates:
- `~/.ssh/github-actions` (private key) - Add to GitHub secrets
- `~/.ssh/github-actions.pub` (public key) - Add to VM

### 2. Add Public Key to VM

Copy the public key to the VM:

```bash
ssh-copy-id -i ~/.ssh/github-actions.pub your_username@35.212.245.190
```

Or manually:

```bash
# On the VM
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Add Private Key to GitHub Secrets

1. Copy private key content: `cat ~/.ssh/github-actions`
2. Go to GitHub repository > Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste the entire private key (including BEGIN and END lines)

## VM Setup

### 1. Create Deployment Directory

SSH to the VM and create:

```bash
mkdir -p ~/cash-game-tracker
cd ~/cash-game-tracker
```

### 2. Copy docker-compose.prod.yml

Copy the `docker-compose.prod.yml` from the repository to the VM:

```bash
# On your local machine
scp docker-compose.prod.yml your_username@35.212.245.190:~/cash-game-tracker/
```

### 3. Verify Docker Installation

On the VM:

```bash
docker --version
docker-compose --version
```

If not installed, install Docker and docker-compose.

### 4. Configure Firewall

Ensure these ports are open in GCP firewall rules:
- Port 22 (SSH)
- Port 3000 (Web frontend)
- Port 8080 (Server backend)

## Workflow Triggers

The workflow automatically triggers on:
- Push to `main` branch

## Verification

After setup, push to main and:

1. Check workflow status: GitHub > Actions tab
2. Monitor deployment logs in the workflow run
3. Verify containers on VM: `docker ps`
4. Check application logs: `docker-compose -f docker-compose.prod.yml logs`
5. Test endpoints:
   - Web: http://35.212.245.190:3000
   - Server: http://35.212.245.190:8080

## Troubleshooting

### Workflow fails at SSH step
- Verify SSH_PRIVATE_KEY secret is correctly formatted
- Check public key is in VM's ~/.ssh/authorized_keys
- Verify VM_HOST and VM_USER secrets are correct

### Containers fail to start
- SSH to VM and check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env file was created with correct variables
- Check Docker daemon is running: `sudo systemctl status docker`

### Images fail to pull
- Verify GitHub Container Registry authentication
- Check GITHUB_TOKEN has correct permissions
- Ensure repository package visibility settings allow access
```

**Step 3: Verify documentation created**

Run: `cat docs/deployment/github-actions-setup.md | head -20`
Expected: Should see setup documentation

**Step 4: Commit**

```bash
git add docs/deployment/
git commit -m "docs: add GitHub Actions deployment setup guide

Comprehensive setup instructions for:
- GitHub secrets configuration
- SSH key generation and setup
- VM preparation
- Verification steps
- Troubleshooting guide"
```

---

## Task 9: Update Main README with Deployment Info

**Files:**
- Modify: `README.md` (if exists, otherwise skip this task)

**Step 1: Check if README exists**

Run: `test -f README.md && echo "exists" || echo "skip"`

**Step 2: Add deployment section to README**

If README exists, add a deployment section:

```markdown
## Deployment

This project uses GitHub Actions for automated deployment to GCP VM.

- **Trigger:** Push to `main` branch
- **Process:** Tests → Build Docker images → Deploy to GCP VM
- **Setup Guide:** See [docs/deployment/github-actions-setup.md](docs/deployment/github-actions-setup.md)

### Manual Deployment

For local testing or manual deployment:

```bash
# Build images locally
docker-compose build

# Deploy to production (on VM)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```
```

**Step 3: Commit if modified**

```bash
git add README.md
git commit -m "docs: add deployment information to README

Link to setup guide and manual deployment instructions"
```

---

## Task 10: Create GitHub Username Placeholder Replacement Checklist

**Files:**
- Create: `docs/deployment/username-replacement-checklist.md`

**Step 1: Create checklist for GitHub username replacement**

Create `docs/deployment/username-replacement-checklist.md`:

```markdown
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
```

**Step 2: Verify checklist created**

Run: `cat docs/deployment/username-replacement-checklist.md | head -10`
Expected: Should see checklist content

**Step 3: Commit**

```bash
git add docs/deployment/username-replacement-checklist.md
git commit -m "docs: add username replacement checklist

Guides user through replacing YOUR_USERNAME placeholders
with actual GitHub username before deployment"
```

---

## Task 11: Final Verification and Testing Checklist

**Files:**
- Create: `docs/deployment/deployment-verification.md`

**Step 1: Create verification checklist**

Create `docs/deployment/deployment-verification.md`:

```markdown
# Deployment Verification Checklist

Use this checklist to verify the deployment is working correctly.

## Pre-Deployment Verification

- [ ] All `YOUR_USERNAME` placeholders replaced with actual GitHub username
- [ ] GitHub secrets configured (SSH_PRIVATE_KEY, VM_USER, VM_HOST, env vars)
- [ ] SSH public key added to VM's authorized_keys
- [ ] Deployment directory created on VM: `~/cash-game-tracker`
- [ ] docker-compose.prod.yml copied to VM
- [ ] Docker and docker-compose installed on VM
- [ ] GCP firewall rules allow ports 22, 3000, 8080

## First Deployment

1. Push to main branch:
   ```bash
   git push origin main
   ```

2. Monitor workflow:
   - Go to GitHub repository > Actions tab
   - Click on the latest workflow run
   - Watch each step complete

3. Expected workflow steps:
   - ✅ Checkout code
   - ✅ Set up Java 17
   - ✅ Run server tests
   - ✅ Set up Node.js
   - ✅ Install web dependencies
   - ✅ Build web application
   - ✅ Log in to GitHub Container Registry
   - ✅ Build and push server image
   - ✅ Build and push web image
   - ✅ Deploy to GCP VM

## Post-Deployment Verification

### On VM

SSH to VM and verify:

```bash
# Check containers are running
docker ps
# Should see: cash-game-tracker-server and cash-game-tracker-web

# Check container logs
docker-compose -f docker-compose.prod.yml logs --tail=50

# Verify .env file created
cat .env
# Should contain: SPRING_PROFILES_ACTIVE, BACKEND_API_URL, SECURE_COOKIES
```

### From Local Machine

Test endpoints:

```bash
# Test server health
curl http://35.212.245.190:8080/health

# Test web app
curl http://35.212.245.190:3000
```

### In Browser

1. Navigate to: http://35.212.245.190:3000
2. Verify web application loads
3. Test main functionality

## Troubleshooting

### Workflow fails

Check workflow logs in GitHub Actions:
- Identify which step failed
- Review error messages
- Common issues:
  - SSH authentication: Check SSH_PRIVATE_KEY secret
  - Docker build: Check Dockerfile syntax
  - Image push: Verify GITHUB_TOKEN permissions

### Containers not running on VM

SSH to VM and check:

```bash
# Check Docker daemon
sudo systemctl status docker

# Check container status
docker ps -a

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs
```

### Application not accessible

1. Verify containers running: `docker ps`
2. Check firewall rules in GCP console
3. Check application logs: `docker logs cash-game-tracker-server`
4. Verify .env variables are correct

## Rollback Procedure

If deployment fails:

```bash
# On VM, rollback to previous images
cd ~/cash-game-tracker

# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Pull specific version (if tagged)
docker pull ghcr.io/USERNAME/cash-game-tracker-server:previous-tag

# Or restart with last known good images
docker-compose -f docker-compose.prod.yml up -d
```
```

**Step 2: Verify checklist created**

Run: `cat docs/deployment/deployment-verification.md | head -15`
Expected: Should see verification checklist

**Step 3: Commit**

```bash
git add docs/deployment/deployment-verification.md
git commit -m "docs: add deployment verification checklist

Comprehensive checklist for:
- Pre-deployment setup verification
- First deployment monitoring
- Post-deployment testing
- Troubleshooting common issues
- Rollback procedure"
```

---

## Task 12: Push Branch and Create Summary

**Step 1: Push feature branch**

```bash
git push -u origin feature/github-actions-deployment
```

**Step 2: Review changes**

Run: `git log --oneline origin/main..HEAD`
Expected: Should see all commits from this implementation

**Step 3: Verify all files created/modified**

Run: `git diff --name-only origin/main..HEAD`
Expected output:
```
.github/workflows/deploy.yml
docker-compose.prod.yml
docs/deployment/deployment-verification.md
docs/deployment/github-actions-setup.md
docs/deployment/username-replacement-checklist.md
README.md (if modified)
```

---

## Post-Implementation Steps (Manual)

These steps must be done manually by the user, not by automation:

1. **Replace GitHub username placeholders:**
   - Follow `docs/deployment/username-replacement-checklist.md`
   - Replace `YOUR_USERNAME` with actual GitHub username

2. **Configure GitHub secrets:**
   - Follow `docs/deployment/github-actions-setup.md`
   - Add all required secrets to repository

3. **Set up SSH access:**
   - Generate SSH key pair
   - Add public key to VM
   - Add private key to GitHub secrets

4. **Prepare VM:**
   - Create deployment directory
   - Copy docker-compose.prod.yml to VM
   - Configure firewall rules

5. **Test deployment:**
   - Merge feature branch to main
   - Monitor GitHub Actions workflow
   - Verify application running on VM
   - Follow `docs/deployment/deployment-verification.md`

6. **Clean up old deployment scripts (optional):**
   - Archive or delete `cash-game-tracker-server/deploy.sh`
   - Archive or delete `cash-game-tracker-web/deploy.sh`
   - Decommission AWS ECS resources if no longer needed

---

## Success Criteria

- ✅ GitHub Actions workflow file created and valid
- ✅ Production docker-compose file created
- ✅ All documentation created (setup, verification, troubleshooting)
- ✅ Username replacement checklist provided
- ✅ Branch pushed to remote
- ✅ All commits follow conventional commit format
- ✅ Ready for user to complete manual setup steps
