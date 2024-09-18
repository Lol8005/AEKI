# Software that required in computer before start
1. PHP
2. IPFS Desktop

# Package that required to install before start
```
cd frontend
npm install
cd ../backend
npm install
cd ../blockchain 
npm install
```

# How to run the website
Make sure IPFS desktop running. Then run:
```
cd backend
node server.js
```
Open new terminal. Run:
```
cd blockchain
truffle migrate
```
Go to frontend/scripts/contractData.js <br>
Replace AdminManagementAddress and StockManagementAddress with the address generated in Ganache
<br>
<br>
Finally, run the index.php with PHP