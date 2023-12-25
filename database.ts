import mysql, {PoolConnection, RowDataPacket} from "mysql2/promise"

import {Pool} from "mysql2/typings/mysql/lib/Pool";
const connectionPool: Pool = mysql.createPool({
    host: 'yourhost',
    user: 'youruser',
    password: 'pass',
    database: 'Enigma',
    connectionLimit: 10
});

async function fetchSession(pool: Pool, id: string): Promise<RowDataPacket | Error> {
    const connection = await pool.getConnection() as PoolConnection
    const [rows] = await connection.execute<RowDataPacket>('SELECT * FROM sessions WHERE id = ?', [id])
    //connection.release()
    if (rows.length > 0) return rows[0]
    else throw new Error( `Session with id ${id} is not found`)

}
async function addSession(pool: Pool, {id, walletName = null, twittSecret = null, twittName = null, twittId = null, discRefresh = null, discId = null, discName = null}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    const [rows] = await connection.execute<RowDataPacket>(
        'INSERT INTO sessions (id, walletName, twittSecret, twittName, twittId, discRefresh, discName, discId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, walletName, twittSecret, twittName, twittId, discRefresh, discName, discId]
    )
    connection.release()
    // if more than 0 affected row, return true
    return rows.affectedRows > 0;
}



async function addQuest(pool: Pool, {questId, questName, tokens = null, wls = null, nfts = null, socialActions = null, smartActions = null, quiz = null, account}): Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    const [rows] = await connection.execute<RowDataPacket>(
        'INSERT INTO Quests (questId, questName, tokens, wls, nfts, socialActions, smartActions, quiz, account) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [questId, questName, tokens, wls, nfts, socialActions, smartActions, quiz, account]
    )
    connection.release()
    // if more than 0 affected row, return true
    return rows.affectedRows > 0;
}

async function addScore(pool: Pool, {scoreId, socialProof = null, smartactionProof = null, questId, quizAnswers = null, scoreValue, ownerWallet}):Promise<boolean>{
    const connection = await pool.getConnection() as PoolConnection
    const [rows] = await connection.execute<RowDataPacket>(
        'INSERT INTO Scores (scoreId, socialProof, smartactionProof, questId, quizAnswers, scoreValue, ownerWallet) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [scoreId, socialProof, smartactionProof, questId, quizAnswers, scoreValue, ownerWallet]
    )
    connection.release()
    return rows.affectedRows > 0;
}

async function updateRecord(pool: Pool, table: "Quests" | "Scores" | "sessions", IdAndItsType: { type: "questId" | "scoreId" | "id", value: string }, updateObject):Promise<boolean> {
    //questId, scoreId, id
    const idType = IdAndItsType.type
    const idValue = IdAndItsType.value
    const updateColumns = Object.keys(updateObject);
    const updateValues = Object.values(updateObject);
    const connection = await pool.getConnection() as PoolConnection
    // Generate the SET clause dynamically based on the updateData
    const setClause = updateColumns.map(column => `${column} = ?`).join(', ');

    const [rows] = await connection.execute<RowDataPacket>(
        `UPDATE ${table} SET ${setClause} WHERE ${idType} = ?`,
        [...updateValues, idValue]
    );
    connection.release()
    return rows.changedRows > 0;
}

async function deleteSession(pool: Pool, id):Promise<boolean> {
    const connection = await pool.getConnection() as PoolConnection
    const [rows] = await connection.execute<RowDataPacket>('DELETE FROM sessions where id = ?', [id])
    connection.release()
    return rows.affectedRows > 0;
}

export {connectionPool, addSession, fetchSession, updateRecord, deleteSession, addQuest, addScore}

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

