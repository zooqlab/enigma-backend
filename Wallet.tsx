import React, {useEffect, useState} from "react";
import {SessionKit, Session} from "@wharfkit/session/src";
import {WebRenderer} from "@wharfkit/web-renderer";
import {WalletPluginAnchor} from "@wharfkit/wallet-plugin-anchor";
import {gql, request} from "graphql-request";
import {endpoint, generateRandomSequence, chainCommon, getCurrentUnixTime} from "../common";
import {ChainAPI, Serializer, Transaction} from "@wharfkit/antelope";
import {useQuery} from "@tanstack/react-query";
import {LoginResult, SerializedSession} from "@wharfkit/session";
import {ContractKit} from "@wharfkit/contract";
import {
    createcommun,
    editcommun,
    createquest,
    editquest,
    createtask,
    transfer,
    edittask, questaddtask, questremtask
} from "../../Apis/requests/QuestsRelated/questsActions";
import {questData} from "../types";

// component named Wallet, it has login functionality, logout functionality, and a button to login, checks localstorage for session, and displays name if sees it, also logins back if there is a session in localstorage
const sessionKit = new SessionKit({
    appName: "enigma", chains:[chainCommon.chain], ui: new WebRenderer(), walletPlugins:[new WalletPluginAnchor()]}
)


function useGetSession() {
    return  useQuery({
        queryKey: ['getSession'],
        queryFn: async (): Promise<{session: Session | undefined, walletName: string} | undefined> => {
            try {
                const sessions = await sessionKit.getSessions()
                const selected = sessions[-1]
                const session = await sessionKit.restore(selected)
                const walletName = session ? Serializer.objectify(session.actor): ""
                return {session, walletName}

            } catch (e) {
                console.log(e)
                throw new Error(`failed to retrieve session from local storage: ${e}`)
            }
        },
    })
}


function Wallet() {
    const [session, setSession] = useState<Session | null>(null)
    const [walletName, setWalletName] = useState("")

    const {data} = useGetSession()

    useEffect(() => {
        if (data) {
            setSession(data.session);
            setWalletName(data.walletName);
        }
    }, [data])

    const login = async () => {
        const response: LoginResult = await sessionKit.login()
        if (response.session) {
            setWalletName(Serializer.objectify(response.session.actor))
            setSession(response.session)
        }
    }

    return (
        <div>
            <button onClick={login}>Login</button>
            <button onClick={() => questremtask(session, {taskId: 7455201095817067, account: session.actor, relatedquest:1603391529778434})}>   Quest Remove Task </button>
            <button onClick={() => questaddtask(session, {taskId: 7455201095817067, account: session.actor, relatedquest:1603391529778434})}>   Quest Add Task </button>
            <button onClick={() => edittask(session, {
                taskId: 4724563454300966,
                account: session.actor,
                reward: 122,
                description: "ha",
                taskName: 'be',
                requirements: ['reqCEHC', 'reqASSSS'],
                type: "social"
            })}>    Edit task   </button>
            <button onClick={() => createtask(session, {
                account: session.actor,
                reward: 11,
                description: "ha",
                taskName: 'be',
                requirements: ['req1', 'req2'],
                type: "action"
            })}>    Create task   </button>
            <button onClick={() => createquest(session, {avatar: "https://testavatar.imgur", communityId: 8888888888888888, account: session.actor, questName:"TestQuest", end: getCurrentUnixTime() + 48*60*60})}>Create quest  </button>
            <button onClick={() => editquest(session, {questId: 1603391529778434, avatar: "NsoPhoto", communityId: 3908624961790186, account: session.actor, questName:"ChfeckKack", end: getCurrentUnixTime() + 73*60*60})}>  Edit quest  </button>
            <button onClick={() => createcommun(session, {avatar: "https://testavatar.imgur", account: session.actor, communityName:"TestCommuna", banners: ["https://linktobanner1.com", "https://linktobanner2.com"]})}>   Create Commun</button>
            <button onClick={() => editcommun(session, {communityId: 3908624961790186, avatar: "https://testasssvatarOOOO.imgur", account: session.actor, communityName:"sexuha", banners: ["https://linktobanner31.com", "https://linktobanner22.com"]})}>   Edit Commun</button>
            <p>{walletName}</p>
        </div>
    )
}

export default Wallet

