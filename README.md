# RENT CHECK Instructions 

## Add to vscode via terminal
git clone https://github.com/RedzerRiley/RentCheck

code RentCheck


## Alternative way

Download zip file

Extract 

Put in VScode or any IDEs

## How to run: in the built-in terminal of your IDE type
```bash

npm install

npm run dev

ctrl + click Localhost

ex:  Local:   http://localhost:3000/

```
# Git Setup & Workflow Guide

This guide explains how to:

- Initialize Git (first-time setup)
- Connect to the remote repository
- Work properly using branches
- Push changes safely

---

#  Install Git 

Download and install Git:

https://git-scm.com/downloads

Check if Git is installed:

```bash
git --version

```

# Configure Git
Set your name and email (use the same email as your GitHub account):

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

# 🧩 If You Downloaded the ZIP Instead of Cloning

If you downloaded the project as a ZIP file from GitHub, it is NOT connected to the remote repository yet.

Follow these steps to connect it:

---

## 1️⃣ Extract the ZIP File

Unzip the folder and open it in your terminal or VS Code.

Then navigate into the project folder:

```bash
cd REPO-NAME

```

# Initialize Git 

``` bash

git init 
```

# Add the remote repository 
``` bash
git remote add origin https://github.com/RedzerRiley/RentCheck

```
Check if it was added:

``` bash
git remote -v
```
You should see origin listed.

# Pull the existing Remote Branch 
If the remote already has commits (very likely), do this:
```bash
git fetch origin
git checkout -b main origin/main

```

# Switch to your branch (the one you will be working on)

Example: 

``` bash
git switch admin-page

```

# Pushing your finished code to main

In your branch if you have finished your code you must push your feature to main to be reviewed and checked:

``` bash
git add . 
git commit -m "Your message, short but detailed" 
git push -u origin feature-branch

```
# Remember when you're in a branch your working on please do these commands to always be up to date with main

``` bash
git pull --rebase origin main
```

# How to run database

In the IDE terminal run:

``` bash
npm install firebase

```
Put the .env file within RentCheck directory 
``` bash
RentCheck/
├─ node_modules/
├─ public/
├─ src/
├─ package.json
├─ vite.config.ts
├─ .env          ← move it here!

```
# !!! DO NOT SHARE .ENV FILE OR PUSH .ENV FILE INTO THE REPO IT CONTAINS OUR API KEY !!!!
