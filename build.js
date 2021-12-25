import fs from 'fs/promises';
import ejs from 'ejs';

const content = await ejs.renderFile('app.tmpl.yaml', process.env);
await fs.writeFile('app.yaml', content);
