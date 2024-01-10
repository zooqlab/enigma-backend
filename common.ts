import {Action, APIClient, Serializer, Transaction} from "@wharfkit/antelope";
import {Session, TransactResult} from "@wharfkit/session";
import {Contract, ContractKit} from "@wharfkit/contract";
import {WalletPluginPrivateKey} from "@wharfkit/wallet-plugin-privatekey";

const contractname = "testacc"

const endpoint = 'http://localhost:8000/graph'
const rpcUrl = "https://wax-test.blokcrafters.io"
const chainCommon = {
    chain: {
        id: "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
        url: rpcUrl
    },
    client: new APIClient({ url: rpcUrl }),
}

const contractKit = new ContractKit({
    client: chainCommon.client
})

const contract: Contract = await contractKit.load(contractname)
function parseCookie(cookieString) {
    try
    {return cookieString
        .split(';')
        .map(cookie => cookie.trim().split('='))
        .reduce((acc, [name, value]) => ({ ...acc, [name]: value }), {})}
    catch (e) {
        return ""
    }

}

function getCurrentUnixTime() {
    return Math.floor(Date.now() / 1000)
}
function generateRandomSequence(): number {
    const sequenceLength = 16;

    let sequence = '';
    for (let i = 0; i < sequenceLength; i++) {
        const digit: number = Math.floor(Math.random() * 10); // Generates a random digit (0-9)
        sequence += digit.toString(); // Convert the digit to a string and append to the sequence
    }
    return parseInt(sequence)

}

function GetSession() {
    const args = {
        chain: chainCommon.chain,
        actor: contractname,
        permission: "active",
        walletPlugin: new WalletPluginPrivateKey(
            "privkey"
        ),
    }
    const options = {
        // Additional options
    }
    return new Session(args, options)
}

async function getTransaction_n_Signature(session: Session, action: Action): Promise<TransactResult> {
    const {abi} = await session.client.v1.chain.get_abi(contractname)
    const txinfo = await session.transact({action}, {broadcast: false} )
    const tx = txinfo.transaction
    const signature = String(txinfo.signatures[0])
    const rawtrans = Transaction.from(tx, abi)
    const transaction = Serializer.objectify(rawtrans)
    return {transaction, signature}

}

const securityactionchecks = (actionsInfo, actionName) => {
    if (actionsInfo.length > 1 || actionsInfo.length === 0) return false
    if (actionsInfo[0].authorizers[0].actor == contractSession.actor) return false
    if (actionsInfo[0].actionInfo.account != contractSession.actor || actionsInfo[0].actionInfo.name != actionName) return false
    return true
}

async function TransactionData(transaction: Transaction, session: Session): {authorizers: any[], actionInfo: { account: string, name: string }, actionData: any}[] {
    const actionsArray = []
    for (const action of transaction.actions) {
        let objectifiedAction = Serializer.objectify(action)
        const {abi} = await session.client.v1.chain.get_abi(objectifiedAction.account)
        let decodedActionData = action.decodeData(abi)
        actionsArray.push({authorizers: objectifiedAction.authorization, actionInfo: {account: objectifiedAction.account, name: objectifiedAction.name}, actionData: Serializer.objectify(decodedActionData)})
    }
    return actionsArray

}

export {parseCookie, generateRandomSequence, chainCommon, endpoint, getCurrentUnixTime, TransactionData, GetSession, contractname, contractKit, getTransaction_n_Signature, contract, securityactionchecks}