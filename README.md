# A NodeJS Fitness Social Media Web App using Strava API

## Set-up Instructions for Bash Shell:

### 1. Install Node and NPM
```
sudo apt-get update
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 16
```
### 2. Install the required modules
```
npm install express
npm install ejs
npm install mysql2
npm install express-session
npm install express-validator
npm install bcrypt
npm install dotenv
```
### 3. Install MySQL.
```
sudo apt-get mysql
```
### 4. Run the create_db script in the Social-Fitness-Web-App directory
```
sudo mysql
source create_db.sql;
exit
```
### 5. Run index.js
```
node index.js
```


