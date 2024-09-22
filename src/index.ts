import http from 'http';
import app from './app';
import config from './config/config';
import * as crypto from 'crypto';

const index = http.createServer(app);

index.listen(3000, () => {
    console.log(`Server running on port ${config.port}`);
});

const message = '{"cid":"avogame","playerId":"123","productId":"nft-aviatrix","roundId":"1"}';
const secret = '5808c8a9-fe27-43fc-8a4a-c20493f96a1e';

const hmac = crypto.createHmac('md5', secret);
hmac.update(message);

const hash = hmac.digest('base64');
console.log(hash);