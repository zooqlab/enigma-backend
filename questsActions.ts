import {contractname, endpoint, generateRandomSequence, getTransaction_n_Signature, contract} from "../../../src/common";
import {Session} from "@wharfkit/session/src";
import {communityData, questData, taskData} from "../../../src/types";
import {TransactResult} from "@wharfkit/session";
import {Action, Serializer, Transaction} from "@wharfkit/antelope";
import {gql, request} from "graphql-request";





const createquest = async (session: Session, data: questData): Promise<boolean | Error> => {
    try {
        data.questId = generateRandomSequence()
        const action: Action = contract.action('createquest', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                createQuest(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.createQuest
    } catch (e) {console.log("Error: ", e.message)}
}


const createcommun = async (session: Session, data: communityData): Promise<boolean | Error> => {
    try {
        data.communityId = generateRandomSequence()
        const action = contract.action('createcommun', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                createCommun(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.createCommun

    } catch (e) {console.log(e.message)}
}

const editcommun = async (session: Session, data: communityData): Promise<boolean | Error> => {
    try {
        const action = contract.action('editcommun', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                editCommun(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.editCommun

    } catch (e) {console.log(e.message)}
}

const editquest = async (session: Session, data: questData): Promise<boolean | Error> => {
    try {
        const action = contract.action('editquest', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                editQuest(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.editQuest

    } catch (e) {console.log(e.message)}
}


const createtask = async (session: Session, data: taskData): Promise<boolean | Error> => {
    try {
        data.taskId = generateRandomSequence()
        const action = contract.action('createtask', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                createTask(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.createTask

    } catch (e) {console.log(e.message)}
}

const edittask = async (session: Session, data: taskData): Promise<boolean | Error> => {
    try {
        const action = contract.action('edittask', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                editTask(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.editTask

    } catch (e) {console.log(e.message)}
}

const questaddtask = async (session: Session, data: {taskId: number, account: string, relatedquest: number}): Promise<boolean | Error> => {
    try {
        const action = contract.action('questaddtask', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                questAddTask(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.questAddTask

    } catch (e) {console.log(e.message)}
}

const questremtask = async (session: Session, data: {taskId: number, account: string, relatedquest: number}): Promise<boolean | Error> => {
    try {
        const action = contract.action('questremtask', data, {
            authorization:[{actor: session.actor, permission: "active"}, {actor: contractname, permission: "active"} ]
        })
        const {transaction, signature} = await getTransaction_n_Signature(session, action)
        const response = await request(
            endpoint,
            gql`mutation($transaction: JSON!, $signature: String!) {
                questRemTask(transaction: $transaction, signature: $signature)
            }
            `,
            {
                transaction,
                signature
            }
        )
        return response.questRemTask

    } catch (e) {console.log(e.message)}
}



export {createtask, edittask, questaddtask, questremtask, createquest, createcommun, editcommun, editquest}