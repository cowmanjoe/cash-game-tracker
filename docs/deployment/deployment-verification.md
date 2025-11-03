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
