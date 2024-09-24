import express from "express";
import cors from "cors";
import { body, validationResult } from "express-validator";

import { ethers } from "ethers";
import nodemailer from 'nodemailer';

import fs from 'node:fs';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

global.contactList = new Map();

app.post(
	"/setReminder",
	body("email").isEmail().withMessage("Must be a valid email address"),
	body("ethAddress"),
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
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

const contract = new ethers.Contract("0x2f88BF9302B50967Dccb9FAB3be312Adc756dF6C", (await new Response(fs.readFileSync('./../blockchain/build/contracts/PurchaseProduct.json')).json()).abi, provider);

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
        const email = global.contactList[userAddress];
        
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: email,
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

// Optional: Error handling for the provider
provider.on('error', (error) => {
    console.error('Provider error:', error);
});


app.listen(port, () => {
	console.log(`email server listening at http://localhost:${port}`);
});
