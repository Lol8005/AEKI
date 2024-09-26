# Software that required in computer before start
1. PHP - https://www.youtube.com/watch?v=zT6QrGIfXaU&themeRefresh=1
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
Open Ganache, add truffle config from blockchain folder and start
Open new terminal. Run:
```
cd blockchain
truffle migrate
```
After it runs, it will show all 5 deployed contract address. Please record it down.
<br>
<br>

Go to frontend/scripts/contractData.js <br>
Replace AdminManagementAddress, StockManagementAddress, purchaseProductAddress, refundClientAddress and refundAdminAddress with the address generated in Ganache
<br>
Then go to remix, change the enivronment to Ganache. 
<br>
1. Copy RefundClient.sol and PurchaseProduct.sol to the remix
2. Select 'RefundClient.sol' in deploy tab, copy the deployed address and paste it at the 'At Address'
3. Press 'At Address' to get deployed 'RefundClient'
4. Under the contract, got function 'setRefundAdmin' and add deployed 'refundAdmin' address to the field and press transact
5. Select 'PurchaseProduct.sol' in deploy tab, copy the deployed address and paste it at the 'At Address'
6. Press 'At Address' to get deployed 'RefundClient'
7. Under the contract, got function 'setRefundAddress' and add deployed 'refundClient' and 'refundAdmin' address to the field and press transact
<br><br>
1. Go to backend/server.js
2. Go to line 68, replace the private key with the private key provided by Ganache (Use first address - private key) 
3. Go to line 73-76, replace all the address with the deployed address
4. Make sure IPFS desktop running. Then run:
```
cd backend
node server.js
```
<br><br>
Finally, run the index.php with PHP