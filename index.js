import dotenv from 'dotenv';
import app from './src/app.js';
import os from 'os';

dotenv.config();

const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};
const PORT = 5000
app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIp();
    console.log('Server is running!');
    console.log(`Local:     http://localhost:${PORT}`);
    console.log(`On Phone:  http://${ip}:${PORT}  ← USE THIS IN YOUR APP`);
});