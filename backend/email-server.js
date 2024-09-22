import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Upload data (including files) to IPFS
app.post('/sendRefund', async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`email server listening at http://localhost:${port}`);
});
