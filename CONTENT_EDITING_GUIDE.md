# How to Edit Page Content

## Method 1: Edit Source Files (Immediate)

### Edit About Page:
```bash
# Edit file
nano /home/jenkins/milktix/frontend/src/pages/About.tsx

# Key sections to edit:
1. Stats (line 9-14): Change the numbers
2. Features (line 16-47): Edit titles/descriptions  
3. Team (line 49-54): Update team members
4. Mission text (around line 80): Change paragraph text
```

### Edit Contact Page:
```bash
nano /home/jenkins/milktix/frontend/src/pages/Contact.tsx

# Key sections:
1. Contact info cards (line 20-36): Phone, email, address
2. FAQs (line 38-57): Add/remove questions
```

### Edit Terms/Privacy:
```bash
nano /home/jenkins/milktix/frontend/src/pages/Terms.tsx
nano /home/jenkins/milktix/frontend/src/pages/Privacy.tsx

# Edit the text content in each section
```

### After Editing:
```bash
cd /home/jenkins/milktix/frontend
npm run build          # Build the changes
cd ..
./update-version.sh    # Update version
docker build -t milktix-frontend:latest ./frontend
```

---

## Method 2: Admin CMS (What You Asked For)

Let me create a simple CMS for editable pages:
