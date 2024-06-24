const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Handle file upload
app.post('/upload', upload.array('files'), (req, res) => {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    // Process each file and move it to appropriate folder based on extension
    req.files.forEach(file => {
        const ext = path.extname(file.originalname).toLowerCase().substring(1); // Get extension without the dot
        const folder = path.join(__dirname, 'uploads', ext);

        // Create folder if it doesn't exist
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Move file to designated folder
        const oldPath = file.path;
        const newPath = path.join(folder, file.originalname);

        fs.rename(oldPath, newPath, err => {
            if (err) {
                console.error('Error moving file:', err);
            }
        });
    });

    res.json({ message: 'Files uploaded successfully' });
});

// Get list of uploaded files
app.get('/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    const filesList = [];

    fs.readdir(directoryPath, (err, folders) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }

        folders.forEach(folder => {
            const folderPath = path.join(directoryPath, folder);
            if (fs.lstatSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                files.forEach(file => {
                    filesList.push({ folder, file });
                });
            }
        });

        res.json(filesList);
    });
});

// Delete a file
app.delete('/delete/:folder/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.folder, req.params.filename);
    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).send('File not found');
        }
        res.send('File deleted');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
