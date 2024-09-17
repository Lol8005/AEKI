import express from 'express';
import cors from 'cors';
import { create } from 'kubo-rpc-client';
import multer from 'multer';

const app = express();
const port = 4000;

// IPFS API connection settings
const ipfsApiUrl = 'http://localhost:5001'; // Replace with your IPFS API URL
const ipfs = new create(ipfsApiUrl);

// Set up Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Upload data (including files) to IPFS
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

// Retrieve data (including files) from IPFS
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

app.listen(port, () => {
    console.log(`IPFS backend listening at http://localhost:${port}`);
});
