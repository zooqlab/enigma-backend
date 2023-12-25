import {gql} from "apollo-server-core";

const typeDefs = gql`
    type Query {
        getDiscordInfo(token: String): String
        startTwittAuth: twittAuthAnswer
        finishTwittAuth(token: String, verifier: String): String
        checkDiscordRole(roleId: String!, userId: String!, guildId: String!): Boolean
    }
    
    type twittAuthAnswer {
        link: String,
        secret: String,
        added: Boolean
    }

    scalar JSON
`




export default typeDefs