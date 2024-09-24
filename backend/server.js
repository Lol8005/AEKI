import express from 'express';
import cors from 'cors';
import { create } from 'kubo-rpc-client';
import multer from 'multer';

import { body, validationResult } from "express-validator";
import { ethers } from "ethers";
import nodemailer from 'nodemailer';
import fs from 'node:fs';

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
const contractAddress = "0x971c327db7711C6e7dAB8292f8f6C69dfC64260A";
const providerURL = "http://127.0.0.1:7545";
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

// Ganache
const provider = new ethers.JsonRpcProvider(providerURL);

const contract = new ethers.Contract(contractAddress, (await new Response(fs.readFileSync('./../blockchain/build/contracts/PurchaseProduct.json')).json()).abi, provider);

const transporter = nodemailer.createTransport({
    host: 'app.debugmail.io',
    port: 25,
    secure: false,
    auth: {
        user: '739d2f1d-ab9d-462f-8f3d-bf368d2a5afa', // Your email
        pass: '6cc6bebf-8b3f-452b-8a19-22e6852d4471' // Your email password (or app-specific password)
    }
});

// Listen for the event
contract.on('callReminderEvent', async (userAddresses, timestamp) => {
    console.log('Reminder Event Received:', { userAddresses, timestamp });

    for (let index = 0; index < userAddresses.length; index++) {
        const userAddress = userAddresses[index];
        //const email = global.contactList[userAddress];

        console.log(userAddresses.map((x) => global.contactList[x]));
        
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: userAddresses.map((x) => global.contactList[x]),
            subject: 'Reminder Alert',
            text: `Reminder: ${reminderMessage}\nTime: ${new Date(timestamp * 1000).toLocaleString()}`
        };
    
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
});

//#endregion


app.listen(port, () => {
    console.log(`IPFS and email server backend listening at http://localhost:${port}`);
});
