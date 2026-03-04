# MilkTix Development Workflow

## Process for Kimi Code Development

### 1. Kimi Code on Xavier Does Development
- SSH to Xavier (173.212.241.42)
- Work in ~/projects/Milktix
- Create feature branches for changes
- Commit with descriptive messages

### 2. Code Review & Testing
- Kimi Code pushes to GitHub
- I review the changes
- Test locally or on staging

### 3. Deployment to Production
- Merge to main branch
- Deploy to Harvey (207.244.251.233)
- Verify on milktix.com

## Current Status
- Repository: github.com/bilyfoster/Milktix
- Production: https://milktix.com (Harvey server)
- Development: Xavier server

## Next Tasks for Kimi Code
1. Connect frontend to backend APIs
2. Implement authentication flows
3. Add event creation API integration
4. Add ticket purchase flow
5. Implement check-in functionality

## Git Workflow
```bash
# On Xavier
ssh jenkins@173.212.241.42
cd ~/projects/Milktix
git checkout -b feature/name
# Make changes
git add .
git commit -m "feat: description"
git push origin feature/name

# Then I review and merge
```
