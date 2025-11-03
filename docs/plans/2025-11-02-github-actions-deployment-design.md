# GitHub Actions CI/CD Deployment Design

**Date:** 2025-11-02
**Target:** GCP VM at 35.212.245.190
**Container Registry:** GitHub Container Registry (ghcr.io)

## 1. Architecture Overview

### Workflow Structure
- Single workflow file: `.github/workflows/deploy.yml`
- Triggers on any push to the `main` branch
- No path filtering - both services deploy together to keep them in sync

### Container Registry
Docker images will be pushed to GitHub Container Registry:
- `ghcr.io/YOUR_USERNAME/cash-game-tracker-server:latest`
- `ghcr.io/YOUR_USERNAME/cash-game-tracker-web:latest`

### Deployment Flow
1. Push to main triggers the workflow
2. Checkout code
3. Run tests for both server and web
4. Build Docker images for both services
5. Push images to GitHub Container Registry
6. SSH into GCP VM (35.212.245.190)
7. Write environment variables from GitHub secrets to `.env` file
8. Pull latest images using docker-compose
9. Restart containers with docker-compose

### Key Design Decisions
- Separate workflows per service: **No** - Single combined workflow
- Deploy on push to main: **Yes**
- Run tests before deploy: **Yes**
- Path filtering: **No** - Always deploy both services together
- Notifications: GitHub built-in status only
- Container management: Docker Compose
- Environment variables: Managed via GitHub secrets, written to VM during deployment

## 2. Workflow Jobs & Steps

### Single Job: `deploy`
Runs on `ubuntu-latest`

**Steps:**
1. **Checkout code** - Pull the repository
2. **Setup Java 17** - For the Kotlin/Spring server tests, with Gradle caching
3. **Run server tests** - Execute `./gradlew test` from `cash-game-tracker-server/` directory
4. **Setup Node.js** - For the React web tests, with npm caching
5. **Install web dependencies** - Run `npm install` in `cash-game-tracker-web/` directory
6. **Run web tests** - Execute `npm test` in the web directory
7. **Login to GitHub Container Registry** - Authenticate Docker with ghcr.io using `GITHUB_TOKEN`
8. **Build server image** - Build and tag as `ghcr.io/YOUR_USERNAME/cash-game-tracker-server:latest`
9. **Build web image** - Build and tag as `ghcr.io/YOUR_USERNAME/cash-game-tracker-web:latest`
10. **Push both images** - Push to GitHub Container Registry
11. **Setup SSH key** - Load SSH private key from GitHub secrets
12. **Deploy to VM** - SSH to 35.212.245.190, write `.env` file, pull images, restart containers

### GitHub Secrets Required
- `SSH_PRIVATE_KEY` - Private SSH key for accessing the VM
- `VM_USER` - Username on the GCP VM
- `VM_HOST` - `35.212.245.190`
- Environment variables for `.env` file:
  - `SPRING_PROFILES_ACTIVE`
  - `BACKEND_API_URL`
  - `SECURE_COOKIES`
  - (Additional environment variables as needed)

## 3. Docker Compose Configuration

### Local Development (docker-compose.yml)
Keep existing `docker-compose.yml` unchanged - continues to support local development with `build:` sections.

### Production (docker-compose.prod.yml)
Create new file for production deployment on the VM:

```yaml
version: '3.8'

services:
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

### Key Changes
- Reference full ghcr.io image paths
- No `build:` sections (pull pre-built images)
- Use `env_file: - .env` for environment variables
- Keep all other configuration (ports, networks, restart policy)

### Deployment Commands
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 4. SSH Deployment Details

### SSH Connection
Uses GitHub Action (e.g., `appleboy/ssh-action`) to execute commands on the VM.

### Deployment Script
Executed via SSH on the VM:

```bash
# Navigate to deployment directory
cd /home/VM_USER/cash-game-tracker

# Write environment variables to .env file
cat > .env << 'EOF'
SPRING_PROFILES_ACTIVE=prod
BACKEND_API_URL=http://server:8080
SECURE_COOKIES=true
# ... other variables from GitHub secrets
EOF

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart containers with new images
docker-compose -f docker-compose.prod.yml up -d

# Cleanup old images
docker image prune -f
```

### Process Flow
1. SSH connection established using private key from GitHub secrets
2. Environment file is written with secrets from GitHub
3. Docker authenticates to ghcr.io to pull images
4. Latest images are pulled
5. Containers restart with new images
6. Old unused images are cleaned up to save disk space

## 5. Prerequisites & Setup Steps

### One-Time Setup on GitHub
1. Generate SSH key pair:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
   ```

2. Add GitHub secrets to repository (Settings > Secrets and variables > Actions):
   - `SSH_PRIVATE_KEY` - Content of `~/.ssh/github-actions` (private key)
   - `VM_USER` - Your username on the GCP VM
   - `VM_HOST` - `35.212.245.190`
   - `SPRING_PROFILES_ACTIVE` - e.g., `prod`
   - `BACKEND_API_URL` - e.g., `http://server:8080`
   - `SECURE_COOKIES` - e.g., `true`
   - (Additional environment variables as needed)

### One-Time Setup on GCP VM (35.212.245.190)
1. Add the public key to authorized keys:
   ```bash
   cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

2. Create deployment directory:
   ```bash
   mkdir -p ~/cash-game-tracker
   cd ~/cash-game-tracker
   ```

3. Create `docker-compose.prod.yml` in that directory (content from Section 3)

4. Ensure Docker and docker-compose are installed:
   ```bash
   docker --version
   docker-compose --version
   ```

5. Configure GCP firewall rules to allow:
   - Port 3000 (web frontend)
   - Port 8080 (server backend)
   - Port 22 (SSH - should already be open)

### GitHub Container Registry Setup
- Images automatically inherit repository visibility (public/private)
- `GITHUB_TOKEN` automatically has push access - no additional configuration needed

### Post-Deployment Verification
After first successful deployment:

```bash
# Verify containers are running
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Test endpoints
curl http://35.212.245.190:8080/health
curl http://35.212.245.190:3000
```

## 6. Testing & Validation

### Pre-Deployment Tests
- Server: `./gradlew test` must pass
- Web: `npm test` must pass
- If any tests fail, deployment is aborted

### Deployment Validation
- No automatic health checks configured
- Trust docker-compose up exit code
- Manual verification via logs and endpoints

## 7. Migration from ECS

### Deprecated Files
The following ECS deployment scripts will no longer be used:
- `cash-game-tracker-server/deploy.sh`
- `cash-game-tracker-web/deploy.sh`

These can be deleted or archived once GitHub Actions deployment is verified working.

### AWS Resources
Existing ECS resources (cluster, services, task definitions, ECR repositories) can be decommissioned after successful GCP VM deployment is confirmed.

## Implementation Checklist

- [ ] Create `.github/workflows/deploy.yml` workflow file
- [ ] Create `docker-compose.prod.yml` for production
- [ ] Generate SSH key pair for GitHub Actions
- [ ] Configure GitHub secrets (SSH key, VM details, environment variables)
- [ ] Add public key to VM's authorized_keys
- [ ] Set up deployment directory on VM
- [ ] Copy docker-compose.prod.yml to VM
- [ ] Verify Docker and docker-compose installed on VM
- [ ] Configure GCP firewall rules
- [ ] Test workflow with a push to main
- [ ] Verify containers running on VM
- [ ] Test application endpoints
- [ ] Archive/delete old ECS deployment scripts
