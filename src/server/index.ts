import express from 'express';

import { port, targetFile } from '../config.json';
import namesMap from './helpers/namesMap';

const names: Record<string, number> = namesMap(targetFile);

const app = express();

app.get("/name-count", (req: express.Request, res: express.Response) => {
    const { name } = req.query;

    if (!name || !names.hasOwnProperty(name as string)) {
        res.status(404);
        res.send('Name is not found');
        return;
    }
    res.status(200);
    res.json({ name, count:names[name as string] });
});

app.all("*", (req: express.Request, res: express.Response) => {
    res.status(404);
    res.send("Page is not found");
});

app.use((err: Error, req: express.Request, res: express.Response, next: (err: any) => void) => {
    console.log(err);
    res.status(500);
    res.send('Server is not responsible');
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
