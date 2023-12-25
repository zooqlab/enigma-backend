import {TwitterApi} from "twitter-api-v2";

const CONSUMER_SECRET = "your cons secret"
const CONSUMER_KEY = "your cons key"
const client = new TwitterApi({ appKey: CONSUMER_KEY, appSecret: CONSUMER_SECRET });


const CALLBACK_URL = "http://localhost:8000/afterTwitterAuth/" //callback url of your application

async function generateAuth(client, callbackurl) {
    const authLink = await client.generateAuthLink(callbackurl, { linkMode: 'authorize' });
    return {authLink: authLink.url, secret: authLink.oauth_token_secret}
}

async function finishAuthFlow(oauth_token_secret, oauth_token, oauth_verifier) {
    const userClient = new TwitterApi({
        appKey: "your AppKey",
        appSecret: "your appSecret",
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
    });
    const userTwSession = await userClient.login(oauth_verifier)
    const userchik = await userTwSession.client.currentUser()
    return {twittId: userchik.id, twittName: userchik.screen_name}
}



export {generateAuth, finishAuthFlow}

