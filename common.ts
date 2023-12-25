import {APIClient} from "@wharfkit/antelope";

//enter your graphql endpoint
const endpoint = 'http://localhost:8000/graph'
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
function generateRandomSequence(): string {
    const sequenceLength = 16;
    let sequence = '';

    for (let i = 0; i < sequenceLength; i++) {
        const digit: number = Math.floor(Math.random() * 10); // Generates a random digit (0-9)
        sequence += digit.toString(); // Convert the digit to a string and append to the sequence
    }

    return sequence;
}


const rpcUrl = "http://wax-test.blokcrafters.io"
const chainCommon = {
    chain: {
        id: "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
        url: rpcUrl


    },
    client: new APIClient({ url: rpcUrl }),
}


export {parseCookie, generateRandomSequence, chainCommon, endpoint, getCurrentUnixTime}