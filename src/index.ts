import http from 'http';
import app from './app';
import config from './config/config';

const index = http.createServer(app);

index.listen(3000, () => {
    console.log(`Server running on port ${config.port}`);
});