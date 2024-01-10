import {gql} from "apollo-server-core";

const typeDefs = gql`
    type Query {
        getDiscordInfo(token: String): String
        startTwittAuth: twittAuthAnswer
        finishTwittAuth(token: String, verifier: String): String
        checkDiscordRole(roleId: String!, userId: String!, guildId: String!): Boolean
    }

    type Mutation {
        createQuest(signature: String!, transaction: JSON!): Boolean
        createCommun(signature: String!, transaction: JSON!): Boolean
        editQuest(signature: String!, transaction: JSON!): Boolean
        editCommun(signature: String!, transaction: JSON!): Boolean
        createTask(signature: String!, transaction: JSON!): Boolean
        editTask(signature: String!, transaction: JSON!): Boolean
        questAddTask(signature: String!, transaction: JSON!): Boolean
        questRemTask(signature: String!, transaction: JSON!): Boolean
        submitTask(signature: String!, transaction: JSON!): Boolean
    }
    
    
    
    type twittAuthAnswer {
        link: String,
        secret: String,
        added: Boolean
    }
    
    type Community {
        communityId: String!
        communityName: String!
        score: Int
        avatar: String
        account: String
        followers: Int
        quests: [Quest]
        banners: [String]
    }
    
    type Quest {
        questId: String!
        questName: String
        end: Int
        avatar: String
        account: String
        tasks: [Task]
        relatedcommunity: String
        nfts: [String]
        wls: Int
        
       
    }
    
    type Task {
        taskId: String!
        taskName: String
        account: String
        relatedquest: String
        type: String
        requirements: String
        reward: Int
        completedat: Int
        description: String
        timescompleted: Int
    }
    
    
    
    scalar JSON
`




export default typeDefs