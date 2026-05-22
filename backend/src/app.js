const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes       = require('./routes/auth');
const activityRoutes   = require('./routes/activities');
const assetRoutes      = require('./routes/assets');
const incidentRoutes   = require('./routes/incidents');
const taskRoutes       = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/assets',     assetRoutes);
app.use('/api/incidents',  incidentRoutes);
app.use('/api/tasks',      taskRoutes);

app.get('/', (req, res) => res.json({ message: 'Greenfield API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));