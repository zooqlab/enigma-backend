import {changeCodeGetIdentity, checkInGuildAndHasRole} from "./requests/DiscRelated/discrequests.ts";
import {v4} from "uuid";
import {generateAuth, finishAuthFlow} from "./requests/TwittRelated/twittrequests.js";
import {
    addSession,
    fetchSession,
    updateRecord,
    addQuest,
    addScore,
    fetchWallets,
    fetchCommunities,
    fetchCommunity,
    fetchQuest,
    fetchQuests,
    fetchTask,
    fetchUserTaskData, addCommunity, addTask
} from "../database.ts";
import {GraphQLJSON} from "graphql-type-json";
import {APIClient, ChainAPI, SignedTransaction} from "@wharfkit/antelope";
import {questData} from "../src/types";
import { parseCookie, GetSession, TransactionData, submittaskscheck, securityactionchecks} from "../src/common";


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
                //console.log(await addSession(contextValue.dbPool, {id, discRefresh, discId, discName}))
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
        },
    },
    Mutation: {
        async createQuest(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "createquest")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
            if (transResult.processed.receipt.status == "executed") {
                const answer = await addQuest(contextValue.dbPool, actionsInfo[0].actionData)
                return true
            }
            return false
        },
        async createCommun(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "createcommun")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
            if (transResult.processed.receipt.status == "executed") {
                actionsInfo[0].actionData.banners = actionsInfo[0].actionData.banners.join('|')
                const answer = await addCommunity(contextValue.dbPool, actionsInfo[0].actionData)
                return true
            }
            return false
        },
        async editCommun(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "editcommun")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
            if (transResult.processed.receipt.status == "executed") {
                actionsInfo[0].actionData.banners = actionsInfo[0].actionData.banners.join('|')
                const answer = await updateRecord(contextValue.dbPool, "communities", {type:"communityId", value:actionsInfo[0].actionData.communityId}, actionsInfo[0].actionData)
                return true
            }
            return false
        },
        async editQuest(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "editquest")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
            if (transResult.processed.receipt.status == "executed") {
                const answer = await updateRecord(contextValue.dbPool, "Quests", {type:"questId", value:actionsInfo[0].actionData.questId}, actionsInfo[0].actionData)
                return true
            }
            return false
        },
        async createTask(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "createtask")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            try {
                const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
                if (transResult.processed.receipt.status == "executed") {
                    actionsInfo[0].actionData.requirements = actionsInfo[0].actionData.requirements.join('|')
                    const answer = await addTask(contextValue.dbPool, actionsInfo[0].actionData)
                    return true
                }
            } catch (e) {
                console.log("error: ", e)
            }


            return false
        },
        async editTask(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "edittask")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            try {
                const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
                if (transResult.processed.receipt.status == "executed") {
                    actionsInfo[0].actionData.requirements = actionsInfo[0].actionData.requirements.join('|')
                    const answer = await updateRecord(contextValue.dbPool, "Tasks", {type:"taskId", value:actionsInfo[0].actionData.taskId}, actionsInfo[0].actionData)
                    return true
                }
            } catch (e) {
                console.log("error: ", e)
            }


            return false
        },
        async questAddTask(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "questaddtask")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            try {
                const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
                if (transResult.processed.receipt.status == "executed") {
                    const answer = await updateRecord(contextValue.dbPool, "Tasks", {type:"taskId", value:actionsInfo[0].actionData.taskId}, {relatedquest:actionsInfo[0].actionData.relatedquest})
                    return true
                }
            } catch (e) {
                console.log("error: ", e)
            }


            return false
        },
        async questRemTask(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!securityactionchecks(actionsInfo, "questremtask")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            try {
                const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
                if (transResult.processed.receipt.status == "executed") {
                    const answer = await updateRecord(contextValue.dbPool, "Tasks", {type:"taskId", value:actionsInfo[0].actionData.taskId}, {relatedquest:0})
                    return true
                }
            } catch (e) {
                console.log("error: ", e)
            }


            return false
        },
        async submitTask(parent, {transaction, signature}, contextValue) {
            const contractSession = GetSession()
            const contractSignature = await contractSession.signTransaction(transaction)
            const actionsInfo = await TransactionData(transaction, contractSession)
            if (!submittaskscheck()) return false
            if (!securityactionchecks(actionsInfo, "submittask")) return false
            const signedTransaction = SignedTransaction.from({
                ...transaction,
                signatures:[signature, contractSignature[0]],
            })
            try {
                const transResult = await contractSession.client.v1.chain.send_transaction(signedTransaction)
                if (transResult.processed.receipt.status == "executed") {
                    const answer = await updateRecord(contextValue.dbPool, "Tasks", {type:"taskId", value:actionsInfo[0].actionData.taskId}, {relatedquest:0})
                    return true
                }
            } catch (e) {
                console.log("error: ", e)
            }


            return false
        },
    },

    JSON: {
        __serialize(value) {
            return GraphQLJSON.parseValue(value);
        }
    }
}

export default resolvers