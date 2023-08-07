import fs from 'fs';

let rawdata = fs.readFileSync('credentials.json');
let info = JSON.parse(rawdata);

export default info;

