import mysql, {PoolConnection, RowDataPacket} from "mysql2/promise"
import https from 'https'

import {Pool} from "mysql2/typings/mysql/lib/Pool";
const connectionPool: Pool = mysql.createPool({
    host: 'localhost',
    user: 'user',
    password: 'p@ss',
    database: 'Enigma',
    connectionLimit: 10
});

async function fetchSession(pool: Pool, id: string): Promise<RowDataPacket | Error> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM sessions WHERE id = ?', [id])
        //connection.release()
        if (rows.length > 0) return rows[0]
        else throw new Error( `Session with id ${id} is not found`)
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}
async function addSession(pool: Pool, {id, walletName = null, twittSecret = null, twittName = null, twittId = null, discRefresh = null, discId = null, discName = null}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO sessions (id, walletName, twittSecret, twittName, twittId, discRefresh, discName, discId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, walletName, twittSecret, twittName, twittId, discRefresh, discName, discId]
        )
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}


async function addQuest(pool: Pool, {questId, communityId, questName, account, end, wls = 0, claimed = null, avatar = null}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO Quests (questId, communityId, questName, account, end, wls, claimed, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [questId, communityId, questName, account, end, wls, claimed, avatar]
        )
        if (rows.affectedRows > 0) {
            try {
                await addAccount(pool, account)
            } catch (e) {
                if (e.message.includes("Duplicate entry")) console.log("Account already added to accounts Table in db backend")
                else console.log("Uncaught error when adding account name to accounts table: ", e.message)
            }
        }
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function addTask(pool: Pool, {taskId, account, relatedquest, taskName, type = null, requirements = null, reward = null, completedat = null, description = null, timescompleted = null, proof = null}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO Tasks (taskId, account, relatedquest, taskName, type, requirements, reward, completedat, description, timescompleted, proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [taskId, account, relatedquest, taskName, type, requirements, reward, completedat, description, timescompleted, proof]
        )
        if (rows.affectedRows > 0) {
            try {
                await addAccount(pool, account)
            } catch (e) {
                if (e.message.includes("Duplicate entry")) console.log("Account already added to accounts Table in db backend")
                else console.log("Uncaught error when adding account name to accounts table: ", e.message)
            }
        }
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function addCommunity(pool: Pool, {communityId, communityName, account, avatar = null, score = null, followers = null, banners = null}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO Communities (communityId, communityName, account, avatar, score, followers, banners) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [communityId, communityName, account, avatar, score, followers, banners]
        )
        if (rows.affectedRows > 0) {
            try {
                await addAccount(pool, account)
            } catch (e) {
                if (e.message.includes("Duplicate entry")) console.log("Account already added to accounts Table in db backend")
                else console.log("Uncaught error when adding account name to accounts table: ", e.message)
            }
        }
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function addScore(pool: Pool, {scoreId, scoreValue, account}):Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO Scores (scoreId, scoreValue, account) VALUES (?, ?, ?)',
            [scoreId, scoreValue, account]
        )
        if (rows.affectedRows > 0) {
            try {
                await addAccount(pool, account)
            } catch (e) {
                if (e.message.includes("Duplicate entry")) console.log("Account already added to accounts Table in db backend")
                else console.log("Uncaught error when adding account name to accounts table: ", e.message)
            }
        }
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function addAccount(pool: Pool, account) {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>(
            'INSERT INTO Accounts (account) VALUES (?)',
            [account]
        )
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function updateRecord(pool: Pool, table: "Quests" | "Scores" | "sessions" | "Communities" | "Tasks", IdAndItsType: { type: "questId" | "scoreId" | "id" | "communityId" | "taskId", value: string }, updateObject):Promise<boolean> {
    //questId, scoreId, id
    const connection = await pool.getConnection() as PoolConnection
    try {
        const idType = IdAndItsType.type
        const idValue = IdAndItsType.value
        const updateColumns = Object.keys(updateObject);
        const updateValues = Object.values(updateObject);
        // Generate the SET clause dynamically based on the updateData
        const setClause = updateColumns.map(column => `${column} = ?`).join(', ');

        const [rows] = await connection.execute<RowDataPacket>(
            `UPDATE ${table} SET ${setClause} WHERE ${idType} = ?`,
            [...updateValues, idValue]
        );
        return rows.changedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }


}

async function deleteSession(pool: Pool, id):Promise<boolean> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('DELETE FROM sessions where id = ?', [id])
        return rows.affectedRows > 0;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}



async function fetchWallets(pool: Pool):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        let accounts = []
        const [rows] = await connection.execute<RowDataPacket>('SELECT account FROM Accounts')
        rows.map(row => {
            if (!accounts.includes(row.account)) accounts.push(row.account)
        })
        return accounts
    } catch (e) {
            throw e
        } finally {
            connection.release()
        }
}

async function fetchCommunities(pool: Pool):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        let communities = []
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM Communities')
        rows.map(row => {
            communities.push({communityName: row.communityName,  banners: row.banners, communityId: row.communityId, score: row.score, followers: row.followers, account: row.account, avatar: row.avatar})
        })
        return communities
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function fetchCommunity(pool: Pool, communityId):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM Communities WHERE communityId = ?', [communityId])
        const [questsRows] = await connection.execute<RowDataPacket>('SELECT questId, questName FROM Quests WHERE communityId = ?', [communityId])
        const community = rows[0]
        let quests = []
        questsRows.map(row => {
            quests.push({questId: row.questId, questName: row.questName})
        })
        community['quests'] = quests
        return community
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}

async function fetchQuests(pool: Pool):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        let quests = []
        const [rows] = await connection.execute<RowDataPacket>('SELECT questId, questName FROM Quests')
        //const [tasks] = await connection.execute<RowDataPacket>('SELECT questId, questName FROM Tasks')
        rows.map(row => {
            quests.push({questId: row.questId, questName: row.questName})//, communityId: row.communityId, score: row.score, followers: row.followers, account: row.account, avatar: row.avatar})
        })
        return quests
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function fetchQuest(pool: Pool, questId):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM Quests WHERE questId = ?', [questId])
        const [tasks] = await connection.execute<RowDataPacket>('SELECT * FROM Tasks WHERE relatedquest = ?', [questId])
        let quest = rows[0]
        quest["tasks"] = tasks
        return quest
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function fetchTask(pool: Pool, taskId):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM Tasks WHERE taskId = ?', [taskId])
        let task = rows[0]
        return task
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }
}

async function fetchUserTaskData(pool: Pool, taskId, account):Promise<RowDataPacket[]> {
    const connection = await pool.getConnection() as PoolConnection
    try {
        const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM Tasks WHERE taskId = ? AND account = ?', [taskId, account])
        let task = rows[0]
        return task
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}

export {connectionPool, addSession, fetchSession, updateRecord, deleteSession, addQuest, addScore, addTask, addAccount, addCommunity, fetchWallets, fetchCommunities, fetchCommunity, fetchQuests, fetchQuest, fetchTask, fetchUserTaskData}

//console.log(await fetchSession(connectionPool, "126d82e6-de85-4500-b5fe-2fa1554b9bc8"))
/*
let getTransaction = function (args) {
    let url = "https://wax.eosrio.io/v12/history/get_transaction?id=" + args;
    return new Promise(function (resolve) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(data);
            });
        });

    })
};

*/

