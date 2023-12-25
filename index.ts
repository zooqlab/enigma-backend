import { ApolloServer } from '@apollo/server'
import {expressMiddleware} from "@apollo/server/express4";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import express from "express"
import cors from "cors"
import http from "http"
import {TwitterApi} from "twitter-api-v2";
import {connectionPool} from "../database.js";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import resolvers from "./resolvers.js";
import typeDefs from "./schema.js";
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
export {app}

const httpServer = http.createServer(app)
const server = new ApolloServer({
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
    introspection: false,
    typeDefs,
    resolvers
});
await server.start()

app.use('/graph',
    bodyParser.json({limit:'50mb'}),
    cors({ origin: ['http://localhost:8000'] }), // in case there is CORS issues you can specify your origin here
    expressMiddleware(server,{
            context : async({req, res}) => {
                const twApi = new TwitterApi({ appKey: "your AppKEy", appSecret: "your appSecret" });
                const dbPool = connectionPool
                return {twApi, dbPool, res, req}
            }
        }
        )
)



if (!process.env['VITE']) { // this is for production
    console.log(process.env['PORT'] || 5173)
    const frontendFiles = process.cwd() + '/..'
    app.use(express.static(frontendFiles))
    app.get('/*', (_, res) => {
        res.send(frontendFiles + '/index.html')
    })
    app.listen(process.env['PORT'] || 8000)
}
