import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/env.js';

const app = express();

const PORT = config.port;

app.use(cors({origin: config.origin, credentials: true}));
config.isDevelopment ? app.use(morgan('dev')) : app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (_req, res) => {
    res.status(200).send({
        success: true,
        message: 'Server is healthy and ready. No sleeping on bicycle. Let\'s get the API started.',
        environment: config.env
    })
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})