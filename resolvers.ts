import {changeCodeGetIdentity, checkInGuild, checkInGuildAndHasRole, exchangeRefreshToken} from "./discrequests.ts";
import {v4} from "uuid";
import {generateAuth, finishAuthFlow} from "./twittrequests.js";
import {addSession, fetchSession, updateRecord, addQuest, addScore} from "../database.ts";
import {GraphQLJSON} from "graphql-type-json";
import {GetSession} from "../src/smartcontractsrelated/transcreate.mjs";
import {APIClient, ChainAPI, SignedTransaction} from "@wharfkit/antelope";
import {questData} from "../src/types";
import {getCurrentUnixTime, parseCookie} from "../src/common";

const client = new APIClient({ url: "http://wax-test.blokcrafters.io" })
const chainapi = new ChainAPI(client)



function checkInputQuest(questData: questData) {
    const regexForAccName = /^[a-z1-5.]{1,11}[a-z1-5]$/
    if (!regexForAccName.test(questData.account)) throw new Error("name must have between 1 and 12 characters in length. The characters can include a-z, 1-5, and optional dots (.) except the last character")

    if ((typeof questData.questName === 'string' || questData.questName instanceof String) === false) throw new Error("Questname must be string type")

    if (typeof questData.end !== "number" || questData.end < (getCurrentUnixTime() + 24*60*60) ) throw new Error("Entered date of quest End is either not a number or its duration is less than 24 hours")

    // if quest input has either social actions, contract actions or quiz
    if (questData.socialActions || questData.contractActions || questData.quiz) {
        if (!questData.scoring) throw new Error("If social actions, contract actions or quiz fields are provided, scoring field must be provided too.")
    }

    if (questData.wls && typeof questData.wls !== "number") throw new Error("Amount of whitelists entered needs to be a number type")

    if (questData.nfts) {
        if (!Array.isArray(questData.nfts)) {
            throw new Error("Nfts field must be an array with ids of nfts")

        }
        for (const nft of questData.nfts) {
            if (typeof nft !== "number") throw new Error(`All nft ids in array must be a number, id ${nft} is not a number`)
        }

    }
    if (questData.tokens) {
        if (!Array.isArray(questData.tokens)) throw new Error("Tokens field must be an array with key value pairs of tokenName and allocated quantity of it(currently we are supporting only Wax token")

        // iterating through every Token key value pair and checking if token name is WAX and if quantity is entered as number
        for (const token of questData.tokens) {
            const keyAndValue = Object.entries(token)
            for (const [key, value] of keyAndValue) {
                if (key.toUpperCase() !== "WAX") throw new Error("Currently we are supporting only wax as tokens for reward")
                if (typeof value !== "number") throw new Error("Quantity of token needs to be entered as number")
            }

        }

    }
}

const resolvers = {
    Query: {
        async getDiscordInfo(parent, args, contextValue, info) {
            let id = parseCookie(contextValue.req.headers.cookie).Authorization
            const {discRefresh, discId, discName} = await changeCodeGetIdentity(args.token)
            if (!id) {
                id = v4()

                try {
                    const added = await addSession(contextValue.dbPool, {id, discRefresh, discId, discName})
                    if (added) contextValue.res.cookie('Authorization', id, {httpOnly: true, expires: new Date(Date.now() + 31536000000) })
                } catch (e) {
                    console.log("catched error when creating record in disc authorization: ", e)
                }
                //dont forget to add secure: true in production
            }
            else {
                try {
                    await updateRecord(contextValue.dbPool, "sessions", {type:"id", value:id}, {discRefresh, discId, discName})
                } catch (e) {console.log("catched error when updating record in disc authorization: ", e)}
            }
            return `value is ${args.token}, ${JSON.stringify({discRefresh, discId, discName})}`
        },
        async startTwittAuth(parent, args, contextValue) {
            let id = parseCookie(contextValue.req.headers.cookie).Authorization
            const {authLink, secret} = await generateAuth(contextValue.twApi, "http://localhost:8000/afterTwitterAuth/")
            if (!id) {
                id = v4()
                const added = await addSession(contextValue.dbPool, {id, twittSecret: secret})
                //dont forget to add secure: true in production
                contextValue.res.cookie('Authorization', id, {httpOnly: true, expires: new Date(Date.now() + 31536000000) })
            }
            else {
                try {
                    const modified = await updateRecord(contextValue.dbPool, "sessions", {type:'id', value:id}, {twittSecret: secret})
                    if (!modified) throw new Error("Failed to update session with twittSecret")
                } catch (e) {console.error("catched error when updating record in Twitter authorization: ", e)}
            }

            return {link:authLink, secret}
        },
        async finishTwittAuth(parent, args, contextValue) {
            try {
                let id = parseCookie(contextValue.req.headers.cookie).Authorization
                if (args.verifier && args.token && id) {
                    const {twittSecret} = await fetchSession(contextValue.dbPool, id)
                    const {twittId, twittName} = await finishAuthFlow(twittSecret, args.token, args.verifier)
                    if (twittId && twittName) {
                        const modified = await updateRecord(contextValue.dbPool, "sessions", {type:'id', value:id}, {twittName, twittId:twittId.toString()})
                        if (!modified) throw new Error("Failed to update session with twittName and twittId, probably already the same profiled in this session")
                        return `${twittName}, ${twittId}, ${modified}`}
                    else return "Twitter auth failed"
                }
            } catch (error) {
                console.error(error.message);
            }
        },
        async checkDiscordRole(parent, args, contextValue) {
            try {
                const {roleId, userId, guildId} = args
                let id = parseCookie(contextValue.req.headers.cookie).Authorization
                const {discRefresh} = await fetchSession(contextValue.dbPool, id)
                if (!discRefresh) throw new Error(`Could not fetch user session with id ${id}`)
                return await checkInGuildAndHasRole(discRefresh, roleId, guildId, userId, id, contextValue.dbPool)
            } catch (e) {console.error(e)}
        }
    },
    JSON: {
        __serialize(value) {
            return GraphQLJSON.parseValue(value);
        }
    }
}

export default resolvers