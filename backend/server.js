import express from 'express';
import cors from 'cors';
import { create } from 'kubo-rpc-client';
import multer from 'multer';

import { body, validationResult } from "express-validator";
import { ethers } from "ethers";
import nodemailer from 'nodemailer';
import fs, { stat } from 'node:fs';

const app = express();
const port = 4000;

const ipfsApiUrl = 'http://localhost:5001';
const ipfs = new create(ipfsApiUrl);

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.use(cors());

//#region IPFS server

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;

        // Upload file to IPFS
        const result = await ipfs.add({ path: fileName, content: fileBuffer });
        console.log({cid: result.cid.toString(), ...result}.cid);
        res.json({ cid: result.cid.toString(), ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/retrieve/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Retrieve file from IPFS
        const file = [];
        for await (const chunk of ipfs.cat(cid)) {
            file.push(chunk);
        }

        const fileBuffer = Buffer.concat(file);

        // Detect the file type (adjust as needed)
        res.set('Content-Type', 'application/octet-stream');
        res.send(fileBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//#endregion

// give purchase contract address 
const providerURL = "http://127.0.0.1:7545";
const provider = new ethers.JsonRpcProvider(providerURL);
const private_key = "0x22d0aa3346e5695c63b152d98c3897437c90141ba08b0541a98d1aa8060ec4bf"
const signer = new ethers.Wallet(private_key, provider);

const gasLimit = 5000000;

const purchaseProductContractAddress = "0x24E228FDb8f0db30b3D2e95460B1ce23AdA094a1";
const stockManagementContractAddress = "0xcB607261F20A183Cc9C628A1d8D44944a942602F";
const adminManagementContractAddress = "0xB02f26fDf2a051F043d2fCb7D9f1eABC779b8Ef4";

const purchaseContractInstanceRead = new ethers.Contract(purchaseProductContractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/PurchaseProduct.json')).json()).abi, provider);
const purchaseContractInstanceWrite = new ethers.Contract(purchaseProductContractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/PurchaseProduct.json')).json()).abi, signer);
const stockManagementContractInstanceWrite = new ethers.Contract(stockManagementContractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/StockManagement.json')).json()).abi, signer);
const stockManagementContractInstanceRead = new ethers.Contract(stockManagementContractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/StockManagement.json')).json()).abi, provider);
const adminManagementContractInstanceRead = new ethers.Contract(adminManagementContractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/AdminManagement.json')).json()).abi, provider);

//#region Email Server

global.contactList = new Map();

app.post("/setReminder", body("email").isEmail().withMessage("Must be a valid email address"), body("ethAddress"),
	async (req, res) => {
		// Validate request
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, ethAddress } = req.body;

		try {
			console.log(
				`Received email: ${email}, Ethereum Address: ${ethAddress}`
			);

			global.contactList.set(ethAddress, email);

			res.status(200).json({
				message: "Data received successfully!",
				email,
				ethAddress,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
);

// use for debug only
app.get("/getContacts", (req, res) => {
	const contactsArray = Array.from(global.contactList.entries()).map(
		([ethAddress, email]) => ({ ethAddress, email })
	);
	res.status(200).json({ contacts: contactsArray });
});

const transporter = nodemailer.createTransport({
    // host: 'app.debugmail.io',
    // port: 25,
    // secure: false,
    // auth: {
    //     user: '739d2f1d-ab9d-462f-8f3d-bf368d2a5afa', // Your email
    //     pass: '6cc6bebf-8b3f-452b-8a19-22e6852d4471' // Your email password (or app-specific password)
    // }

    host: 'live.smtp.mailtrap.io',
    port: 587,
    secure: false, // use SSL
    auth: {
        user: 'api',
        pass: '1a98c622c21ddc6e506af2e95f557643',
    }
});

// Listen for the event
purchaseContractInstanceRead.on('callReminderEvent', async (userAddresses, timestamp) => {
    console.log('Reminder Event Received:', { userAddresses, timestamp });

    for (const userAddress of userAddresses) {

        // console.log("address: " + global.contactList.get(userAddress));
        
        const mailOptions = {
            from: 'reminder-AEKI@demomailtrap.com',
            to: global.contactList.get(userAddress),
            subject: 'Reminder Alert',
            text: `Reminder: New Product Launch Now !! \nTime: ${new Date(Number(timestamp) * 1000).toLocaleString()}`
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log('Error:'+ error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }
});

purchaseContractInstanceRead.on('setReminderEvent', async (timestamp) => {
    console.log('Reminder Event Received:', { timestamp });

    global.reminderTimeList.add(Number(timestamp));
});

//#endregion


//#region Timelock

global.queue_launchProductTransactionList = [];
global.queue_discontinueProductTransactionList = [];

global.execute_launchProductTransactionList = [];
global.execute_discontinueProductTransactionList = [];

global.cancel_launchProductTransactionList = [];
global.cancel_discontinueProductTransactionList = [];

global.queue_FiredAdminTransactionList = [];
global.execute_FiredAdminTransactionList = [];
global.cancel_FiredAdminTransactionList = [];

global.reminderTimeList = new Set();

class launchDiscontinue_transactionData {
    constructor(productHash, preSignData, functionCall, executionTime, adminAddress) {
        this.productHash = productHash;
        this.preSignData = preSignData;
        this.functionCall = functionCall;
        this.executionTime = executionTime;
        this.adminAddress = adminAddress;
    }
}

class adminDisable_transactionData {
    constructor(admin, functionCall, executionTime) {
        this.admin = admin;
        this.functionCall = functionCall;
        this.executionTime = executionTime;
    }
}

// app.post("/setDiscontinuetime", body("productHash"), body("executionTime"), body("adminAddress"),
// 	async (req, res) => {
		
//         // Validate request
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).json({ errors: errors.array() });
// 		}

// 		const { productHash, executionTime, adminAddress } = req.body;

// 		try {
//             console.log(
//                 `Received transaction data from: ${adminAddress}`
//             );
    
//             const preSign = await stockManagementContractInstanceWrite.updateDiscontinueStatus.populateTransaction({
//                     gasLimit: 500000, 
//                 });
    
//             let foundIndex = -1;
//             for (let index = 0; index < global.queue_discontinueProductTransactionList.length; index++) {
//                 const data = global.queue_discontinueProductTransactionList[index];
                
//                 if(data.productHash == productHash){
//                     foundIndex = index;
//                     break;
//                 }
//             }
    
//             if(foundIndex == -1){
//                 global.queue_discontinueProductTransactionList.push(new launchDiscontinue_transactionData(productHash, preSign, executionTime, adminAddress));
//             }else{
//                 global.queue_discontinueProductTransactionList[foundIndex].preSignData = preSign;
//                 global.queue_discontinueProductTransactionList[foundIndex].executionTime = executionTime;
//             }
    
//             res.status(200).json({
//                 message: "Data received successfully!",
//             });
// 		} catch (error) {
// 			res.status(500).json({ error: error.message });
// 		}
// 	}
// );

// app.post("/setLaunchtime", body("productHash"), body("executionTime"), body("adminAddress"),
// 	async (req, res) => {
		
//         // Validate request
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).json({ errors: errors.array() });
// 		}

// 		const { productHash, executionTime, adminAddress } = req.body;

// 		try {
//             console.log(
//                 `Received transaction data from: ${adminAddress}`
//             );
    
//             const preSign = await stockManagementContractInstanceWrite.updateLaunchStatus.populateTransaction({
//                     gasLimit: 500000, 
//                 });
    
//             let foundIndex = -1;
//             for (let index = 0; index < global.queue_launchProductTransactionList.length; index++) {
//                 const data = global.queue_launchProductTransactionList[index];
                
//                 if(data.productHash == productHash){
//                     foundIndex = index;
//                     break;
//                 }
//             }
    
//             if(foundIndex == -1){
//                 global.queue_launchProductTransactionList.push(new launchDiscontinue_transactionData(productHash, preSign, executionTime, adminAddress));
//             }else{
//                 global.queue_launchProductTransactionList[foundIndex].preSignData = preSign;
//                 global.queue_launchProductTransactionList[foundIndex].executionTime = executionTime;
//             }
    
//             res.status(200).json({
//                 message: "Data received successfully!",
//             });
// 		} catch (error) {
// 			res.status(500).json({ error: error.message });
// 		}
// 	}
// );

// app.post("/cancelDiscontinue", body("productHash"), body("adminAddress"),
// 	async (req, res) => {
		
//         // Validate request
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).json({ errors: errors.array() });
// 		}

// 		const { productHash, adminAddress } = req.body;

// 		try {
//             console.log(
//                 `Received transaction data from: ${adminAddress}`
//             );
    
//             global.queue_discontinueProductTransactionList.forEach(async (transaction) => {
//                 if (transaction.productHash == productHash) {
//                     console.log("Cancel Discontinue: " + transaction.productHash); 
        
//                     global.cancel_discontinueProductTransactionList.push(transaction);
                    
//                     global.queue_discontinueProductTransactionList = global.queue_discontinueProductTransactionList.filter(
//                         (t) => t.productHash !== transaction.productHash
//                     );
//                 }
//             });
    
//             res.status(200).json({
//                 message: "Data received successfully!",
//             });
// 		} catch (error) {
// 			res.status(500).json({ error: error.message });
// 		}
// 	}
// );

// app.post("/cancelLaunch", body("productHash"), body("adminAddress"),
// 	async (req, res) => {
		
//         // Validate request
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).json({ errors: errors.array() });
// 		}

// 		const { productHash, adminAddress } = req.body;

// 		try {
//             console.log(
//                 `Received transaction data from: ${adminAddress}`
//             );
    
//             global.queue_launchProductTransactionList.forEach(async (transaction) => {
//                 if (transaction.productHash == productHash) {
//                     console.log("Cancel Launch: " + transaction.productHash); 
        
//                     global.cancel_launchProductTransactionList.push(transaction);
                    
//                     global.queue_launchProductTransactionList = global.queue_launchProductTransactionList.filter(
//                         (t) => t.productHash !== transaction.productHash
//                     );
//                 }
//             });
    
//             res.status(200).json({
//                 message: "Data received successfully!",
//             });
// 		} catch (error) {
// 			res.status(500).json({ error: error.message });
// 		}
// 	}
// );

stockManagementContractInstanceRead.on('StockDiscontinueEvent', async (productHash, timestamp, status, adminAddress) => {
    timestamp = Number(timestamp);
    status = Number(status);

    console.log('Receive Discontinue Event:', { productHash, timestamp, status, adminAddress });

    const preSign = await stockManagementContractInstanceWrite.updateDiscontinueStatus.populateTransaction({
        gasLimit: gasLimit,
    });

    if(status == 0){
        let foundIndex = -1;
            for (let index = 0; index < global.queue_discontinueProductTransactionList.length; index++) {
                const data = global.queue_discontinueProductTransactionList[index];
                
                if(data.productHash == productHash){
                    foundIndex = index;
                    break;
                }
            }
    
            if(foundIndex == -1){
                global.queue_discontinueProductTransactionList.push(new launchDiscontinue_transactionData(productHash, preSign, "updateDiscontinueStatus()", timestamp, adminAddress));
            }else{
                global.queue_discontinueProductTransactionList[foundIndex].preSignData = preSign;
                global.queue_discontinueProductTransactionList[foundIndex].executionTime = timestamp;
            }

        console.log("Queue Discontinue: " + productHash); 
    }else if (status == 1){
        global.queue_discontinueProductTransactionList.forEach(async (transaction) => {
            if (transaction.productHash == productHash) {
                console.log("Cancel Discontinue: " + transaction.productHash); 
    
                global.cancel_discontinueProductTransactionList.push(transaction);
                    
                global.queue_discontinueProductTransactionList = global.queue_discontinueProductTransactionList.filter(
                    (t) => t.productHash != transaction.productHash
                );
            }
        });
    }
});

stockManagementContractInstanceRead.on('StockLaunchEvent', async (productHash, timestamp, status, adminAddress) => {
    timestamp = Number(timestamp);
    status = Number(status);

    console.log('Receive Launch Event:', { productHash, timestamp, status, adminAddress });

    const preSign = await stockManagementContractInstanceWrite.updateLaunchStatus.populateTransaction({
        gasLimit: gasLimit, 
    });

    if(status == 0){
        let foundIndex = -1;
        for (let index = 0; index < global.queue_launchProductTransactionList.length; index++) {
            const data = global.queue_launchProductTransactionList[index];
            
            if(data.productHash == productHash){
                foundIndex = index;
                break;
            }
        }
    
        if(foundIndex == -1){
            global.queue_launchProductTransactionList.push(new launchDiscontinue_transactionData(productHash, preSign, "updateLaunchStatus()", timestamp, adminAddress));
        }else{
            global.queue_launchProductTransactionList[foundIndex].preSignData = preSign;
            global.queue_launchProductTransactionList[foundIndex].executionTime = timestamp;
        }

        console.log("Queue Launch: " + productHash); 
    }else if (status == 1){
        global.queue_launchProductTransactionList.forEach(async (transaction) => {
            if (transaction.productHash == productHash) {
                console.log("Cancel Launch: " + transaction.productHash); 
    
                global.cancel_launchProductTransactionList.push(transaction);
                
                global.queue_launchProductTransactionList = global.queue_launchProductTransactionList.filter(
                    (t) => t.productHash != transaction.productHash
                );
            }
        });
    }
});

adminManagementContractInstanceRead.on('AdminDisabled', async (admin, disableTime, disableStatus) => {
    disableTime = Number(disableTime);
    disableStatus = Number(disableStatus);

    console.log('Receive admin Event:', { admin, disableTime, disableStatus });

    if(disableStatus == 0){
        let foundIndex = -1;
        for (let index = 0; index < global.queue_FiredAdminTransactionList.length; index++) {
            const data = global.queue_FiredAdminTransactionList[index];
            
            if(data.admin == admin){
                foundIndex = index;
                break;
            }
        }
    
        if(foundIndex == -1){
            global.queue_FiredAdminTransactionList.push(new adminDisable_transactionData(admin, "updateLaunchStatus()", disableTime));
        }else{
            global.queue_FiredAdminTransactionList[foundIndex].executionTime = disableTime;
        }

        console.log("Queue Disable Admin: " + admin); 
    }else if (disableStatus == 1){
        global.queue_FiredAdminTransactionList.forEach(async (transaction) => {
            if (transaction.admin == admin) {
                console.log("Cancel Disable Admin: " + transaction.admin); 
    
                global.cancel_FiredAdminTransactionList.push(transaction);

                console.log(global.cancel_FiredAdminTransactionList)
                
                global.queue_FiredAdminTransactionList = global.queue_FiredAdminTransactionList.filter(
                    (t) => t.admin != transaction.admin
                );
            }
        });
    }else if (disableStatus == 2){
        global.queue_FiredAdminTransactionList.forEach(async (transaction) => {
            if (transaction.admin == admin) {
                console.log("Execute Disable Admin: " + transaction.admin); 
    
                global.execute_FiredAdminTransactionList.push(transaction);
                
                global.queue_FiredAdminTransactionList = global.queue_FiredAdminTransactionList.filter(
                    (t) => t.admin != transaction.admin
                );
            }
        });
    }
});

app.get("/getAllTransactionStatus", (req, res) => {
	var queueProduct = global.queue_launchProductTransactionList.concat(global.queue_discontinueProductTransactionList);
    queueProduct.sort((a, b) => a.executionTime - b.executionTime);

    var executeProduct = global.execute_launchProductTransactionList.concat(global.execute_discontinueProductTransactionList);
    executeProduct.sort((a, b) => a.executionTime - b.executionTime);

    var cancelProduct = global.cancel_launchProductTransactionList.concat(global.cancel_discontinueProductTransactionList);
    cancelProduct.sort((a, b) => a.executionTime - b.executionTime);

    var queueAdmin = global.queue_FiredAdminTransactionList.sort((a, b) => a.executionTime - b.executionTime);
    var executeAdmin = global.execute_FiredAdminTransactionList.sort((a, b) => a.executionTime - b.executionTime);
    var cancelAdmin = global.cancel_FiredAdminTransactionList.sort((a, b) => a.executionTime - b.executionTime);


    queueProduct = queueProduct.map(item => ({
        ...item
    }));

    executeProduct = executeProduct.map(item => ({
        ...item
    }));

    cancelProduct = cancelProduct.map(item => ({
        ...item
    }));

    queueAdmin = queueAdmin.map(item => ({
        ...item
    }));

    executeAdmin = executeAdmin.map(item => ({
        ...item
    }));

    cancelAdmin = cancelAdmin.map(item => ({
        ...item
    }));



    queueProduct.forEach(async (transaction) => {
        if(transaction.preSignData == null) return;

        //console.log(transaction.preSignData);

        console.log(transaction);
        transaction.preSignData.gasLimit = Number(transaction.preSignData.gasLimit);
    });

    executeProduct.forEach(async (transaction) => {
        if(transaction.preSignData == null) return;

        console.log(transaction);
        transaction.preSignData.gasLimit = Number(transaction.preSignData.gasLimit);
    });

    cancelProduct.forEach(async (transaction) => {
        if(transaction.preSignData == null) return;

        console.log(transaction);
        transaction.preSignData.gasLimit = Number(transaction.preSignData.gasLimit);
    });



    // console.log(queue);
    // console.log(execute);
    // console.log(cancel);

	res.status(200).json({ 
        queueProduct: queueProduct,
        executeProduct: executeProduct,
        cancelProduct: cancelProduct,
        queueAdmin: queueAdmin,
        executeAdmin: executeAdmin,
        cancelAdmin: cancelAdmin
    });
});


async function TimeLock() {
    const currentTime = Math.round(Date.now() / 1000) - 10;

    global.queue_discontinueProductTransactionList.forEach(async (transaction) => {
        if (transaction.executionTime <= currentTime) {
            console.log(`Discontinuation time reached for product: ${transaction.productHash}`);

            const tx = await signer.sendTransaction(transaction.preSignData);

            tx.wait();

            console.log("Execute discountinue: " + transaction.productHash);

            global.execute_discontinueProductTransactionList.push(transaction);
            
            global.queue_discontinueProductTransactionList = global.queue_discontinueProductTransactionList.filter(
                (t) => t.productHash !== transaction.productHash
            );
        }
    });

    global.queue_launchProductTransactionList.forEach(async (transaction) => {
        if (transaction.executionTime <= currentTime) {
            console.log(`Launch time reached for product: ${transaction.productHash}`);

            const tx = await signer.sendTransaction(transaction.preSignData)

            tx.wait();

            console.log("Execute Launch: " + transaction.productHash); 

            global.execute_launchProductTransactionList.push(transaction);
            
            global.queue_launchProductTransactionList = global.queue_launchProductTransactionList.filter(
                (t) => t.productHash !== transaction.productHash
            );
        }
    });

    global.reminderTimeList.forEach(async (_time) => {
        if (_time + 5 <= currentTime) {
            console.log("Calling reminder");

            global.reminderTimeList.delete(_time);

            const tx = await purchaseContractInstanceWrite.callReminderNow({gasLimit: gasLimit,})

            tx.wait();

            return;
        }
    });
}

setInterval(TimeLock, 1000);

//#endregion

app.listen(port, () => {
    console.log(`IPFS and email server backend listening at http://localhost:${port}`);
});
