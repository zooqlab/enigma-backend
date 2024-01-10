interface TokenInfo {
    [token: string]: number
}

interface socialAction {
    [actionId: string]: string
}

interface contractAction {
    [actionId: string]: string
}

interface quizQuestion {
    questionType: "single" | "multiple";
    question: string;
    answers: string[];
    correctAnswers: number[],
}

interface Quiz {
    questions: quizQuestion[], reward: number, correctAnswersRequired: number
}

type questData = {
    questName: string;
    account: string;
    end: number;
    communityId: number;
    questId: number;
    avatar?: string;
    tasks?: Task[];
}

type communityData = {
    communityName: string;
    account: string;
    communityId: number;
    avatar?: string;
    banners?: string[];
    questIds?: number[];
    score?: number;
    followers?: number;
}

type Task: "socialAction" | "contractAction" | "Quiz"


type taskData = {
    taskId: number;
    taskName: string;
    type: "social" | "action" | "quiz";
    account: string;
    requirements?: string[];
    reward?: number;
    description?: string;
    timescompleted?: number;
    relatedquest?: number;
}
}

export {questData, communityData, taskData}