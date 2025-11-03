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
