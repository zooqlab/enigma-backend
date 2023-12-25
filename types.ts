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
    tokens?: TokenInfo[];
    socialActions?: socialAction;
    contractActions?: contractAction;
    quiz?: Quiz
    nfts?: number[];
    wls?: number;
    scoring?: {
        [taskId: string]: number;
        quiz?: number;
    }
}

export {questData}