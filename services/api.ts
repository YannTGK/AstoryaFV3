import axios from 'axios';

/* Home */
const api = axios.create({
    baseURL: 'https://astorya-api.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/* Home Yann
const api = axios.create({
    baseURL: 'http://192.168.0.2:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

*/
/*Dyangoo Hotspot

const api = axios.create({
    baseURL: 'http://172.20.10.2:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
*/


export default api;