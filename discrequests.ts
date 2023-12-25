import axios from "axios";
import {updateRecord} from "../database";
import {Pool} from "mysql2/typings/mysql/lib/Pool";

const clientId = 'your client id';
const clientSecret = 'your client secret';
async function exchangeCodeForToken(code) {

    const tokenEndpoint = 'https://discord.com/api/v10/oauth2/token'

    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:8000/discAfterAuth'
    };

    try {
        const response = await axios.post(tokenEndpoint, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        // Access token is available in response.data.access_token
        return {accessToken: response.data.access_token, discRefresh: response.data.refresh_token};
    } catch (error) {
        // Handle error
        console.error('Error exchanging Discord authentication code for token:', error.message);
        //throw error;
        throw new Error("Error exchanging Discord authentication code for token")
    }
};

async function exchangeRefreshToken(refreshToken, sessionId, pool) {
    const tokenEndpoint = 'https://discord.com/api/v10/oauth2/token'

    const data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'http://localhost:8000/discAfterAuth'
    };

    try {
        const response = await axios.post(tokenEndpoint, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        const {access_token, refresh_token} = response.data
        if (access_token && refresh_token) {
            const isUpdated = await updateRecord(pool, "sessions", {type:"id", value:sessionId}, {discRefresh:refresh_token})
            return {isUpdated, access_token, refresh_token}
        }
        else throw new Error("Didnt obtain access and refresh token, some error on exchanging refresh token for access token and new refresh")
    } catch (error) {
        // Handle error
        console.error('Error exchanging Discord refresh token for access token:', error.message);
        //throw error;
        //throw new Error("Error exchanging Discord authentication code for token")
    }
}

async function getIdentity(accessToken): Promise<{id: string, username: string} | undefined> {
    try {
        const response = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const {id, username} = response.data;
        return {discId: id, discName: username};
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error;
    }
}

async function getGuilds(accessToken): Promise<any[]> {
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const guilds = response.data;
        return guilds;
    } catch (error) {
        console.error('Error fetching guilds:', error.message);
        throw error;
    }
}

async function getRoles(accessToken: string, guildId: string): Promise<string[]> {
    try {
        const response = await axios.get(`https://discord.com/api/users/@me/guilds/${guildId.toString()}/member`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const member = response.data;
        const roles = member.roles
        if (!roles) throw new Error("No roles found or user is not a part of a guild")
        return roles
    } catch (error) {
        console.error('Error fetching Roles:', error.message);
        throw error;
    }
}

async function changeCodeGetIdentity (code) {
    const {accessToken, discRefresh} = await exchangeCodeForToken(code)
    const {discId, discName} = await getIdentity(accessToken)
    return {discId, discName, discRefresh}
}

async function checkInGuild (OldRefreshToken, guildId: string, userId: string, sessionId: string, pool: Pool) {
    //const {isUpdated, access_token, refresh_token} = await exchangeRefreshToken(OldRefreshToken, sessionId, pool)
    const resp = await exchangeRefreshToken(OldRefreshToken, sessionId, pool)
    if (!isUpdated) throw new Error("Error on obtaining new access token and refresh token when checking if user is in guild")
    const guilds = await getGuilds(access_token)
    for (guild of guilds) {
        if (guild.id == guildId) return true
    }
    return false
}

async function checkInGuildAndHasRole (OldRefreshToken, roleId: string, guildId: string, userId: string, sessionId: string, pool: Pool) {
    const {isUpdated, access_token, refresh_token} = await exchangeRefreshToken(OldRefreshToken, sessionId, pool)
    if (!isUpdated) throw new Error("Error on obtaining new access token and refresh token when checking if user is in guild")
    const roles = await getRoles(access_token, guildId)
    for (const role of roles) {
        if (role == roleId) return true
    }
    return false
}


export {changeCodeGetIdentity, checkInGuild, checkInGuildAndHasRole, exchangeRefreshToken}