const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (CSS, JS, images, fonts) from React build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve the index.html for all other routes to support React Router SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
