'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');

const config = {
    logging: true,
    intentMap: {
        'AMAZON.YesIntent': 'YesIntent',
        'AMAZON.NoIntent': 'NoIntent',
        'AMAZON.RepeatIntent': 'RepeatIntent',
        'AMAZON.StopIntent': 'StopIntent',
        'AMAZON.HelpIntent': 'HelpIntent',
        'AMAZON.CancelIntent': 'CancelIntent',
    },
};

const app = new App(config);

const questions = [
    'Do any data subjects you are collecting data from, including your employees, reside in the European Economic Area or European Union?',
    'Is your organisation aware of what personal data means under the GDPR?',
    'Have you assessed the impact of the new definition of consent under the GDPR and how this affects your surveys?',
    'Do you have a process for breach notification?',
    'Have you given the data subject the right to access his or her information?',
    'Where a data subject has asked for his or her information, is the information given in a commonly useable and machine readable format?',
    'Does your organisation have the process of erasing the subject’s data at his/her request?',
    'Does your organisation hold and process data only if it is absolutely necessary for the completion of its duties?',
    'Have you trained your staff on the GDPR and how to properly handle data?',
    'Have you considered if you need to appoint a Data Protection Officer (DPO)?',

];

const answers_descriptions = [
    'If you are collecting data from citizens or employees that reside in European Economic Area then GDPR applies to you, even if you are based in a country outside the European Union.',
    'The GDPR\'s definition of personal data is <break time="0.5s"/> Any information relating to an identified or identifiable natural person.',
    'GDPR’s revised approach means you must have clear documentation that the audience is happy for you to email them. And remember, you will need to obtain new consent from any current contacts in your database as well.',
    'There will be a duty for all organisations to report certain types of data breaches and, in some cases, inform the individuals affected by the breach as well.',
    'Individuals must have the right to access any personal data that you store about them and this must be provided free of charge.',
    'When asked, you must use “reasonable means” to supply the information. For example, if the request is made electronically, you should provide the information in a commonly used electronic format.',
    'Make sure you have a process in place for when an individual asks you to delete their personal data',
    'GDPR will introduce the concept of ‘privacy by design\' and by default to encourage organisations to consider data protection throughout the entire life cycle of any process',
    'The majority of data breaches occur because of human error. You must provide evidences to understand the risk and run awareness trainings',
    'For many businesses, it will be mandatory to appoint a DPO, for instance if your core activity involves the regular monitoring of individuals on a large scale',
];

const Translations = {
    'GAME_NAME': 'G.D.P.R. Compliance Checker',
    'HELP_MESSAGE': 'I will ask ten questions related to data handling. <break time="0.5s"/> Just reply either in yes or no.',
    'REPEAT_QUESTION_MESSAGE': 'To repeat the last question, you can say, repeat, to hear it again',
    'ASK_IF_READY': 'Are you ready?',
    'ASK_MESSAGE_START': 'Would you like to start the quiz?',
    'HELP_REPROMPT': 'To give an answer to a question, respond either in yes or no for the question',
    'STOP_MESSAGE': 'Would you like to continue the quiz?',
    'CANCEL_MESSAGE': 'Ok, I hope you come back soon to take the quiz.',
    'NO_MESSAGE': 'Ok, You can come back anytime!',
    'RESPONSE_UNHANDLED': 'Try saying either yes or no',
    'RESPONSE_NO_GDPR': 'Excellent, you don\'t need to worry about G.D.P.R. as of now.<break time="0.5s"/>',
    'HELP_UNHANDLED': 'Say yes to continue, or no to end the game.',
    'NEW_GAME_MESSAGE': 'Hi, I\'m G.D.P.R. Compliance Checker.',
    'WELCOME_MESSAGE': 'I will ask ten questions related to data handling. <break time="0.5s"/> Just reply either in yes or no.',
    'ANSWER_CORRECT_MESSAGE': 'correct. ',
    'ANSWER_WRONG_MESSAGE': 'wrong. ',
    'CORRECT_ANSWER_MESSAGE': 'The correct answer is {{correctAnswerIndex}}: {{correctAnswerText}}. ',
    'ANSWER_IS_MESSAGE': 'That answer is ',
    'TELL_QUESTION_MESSAGE': 'Question {{questionNumber}}. {{question}} ',
    'GAME_OVER_MESSAGE': 'You got {{currentScore}} out of {{gameLength}} questions correct. Thank you for playing!',
    'SCORE_IS_MESSAGE': 'Your score is {{currentScore}}. ',
};
// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    LAUNCH() {
        const speech = `${Translations.NEW_GAME_MESSAGE} ${Translations.WELCOME_MESSAGE} ${Translations.ASK_MESSAGE_START}`;
        let rePrompt = `${Translations.HELP_REPROMPT}${Translations.ASK_MESSAGE_START}`;
        this.setSessionAttribute('answers', []);
        this.followUpState('StartQuizState').ask(speech, rePrompt);
    },
    StartQuizState: {
        QuestionsIntent(data) {
            const count = this.getSessionAttribute('answers').length;
            if (count === questions.length) {
                this.toIntent('ResultIntent');
                return;
            }
            let speech = '';
            if (data && data.yes && count > 0) {
                speech = data.yes +
                    '<break time="0.5s"/> Next Question, <break time="0.5s"/>' +
                    questions[count];
            } else if (data && data.no) {
                speech = data.no +
                    '<break time="1s"/>Next Question, <break time="0.5s"/>' +
                    questions[count];
            } else if (data && data.repeat) {
                speech = 'Repeating the question, <break strength="weak"/>' +
                    questions[count];
            } else {
                speech = questions[count];
            }
            this.followUpState('ResponseState').ask(speech, questions[count]);
        },
        YesIntent() {
            this.toStateIntent('StartQuizState', 'QuestionsIntent');
        },
        NoIntent() {
            this.toIntent('END', Translations.NO_MESSAGE);
        },
        RepeatIntent() {
            this.ask(`${Translations.HELP_MESSAGE}`,
                `${Translations.HELP_REPROMPT}`);
        },
        HelpIntent() {
            this.toStateIntent('HelpState', 'HelpUser', true);
        },
        CancelIntent(){
            this.toStatelessIntent('END', Translations.CANCEL_MESSAGE)
        }
    },
    ResponseState: {
        YesIntent() {
            let answers = this.getSessionAttribute('answers');
            answers.push(1);
            this.setSessionAttribute('answers', answers);
            let responses = ['Great!', 'Amazing!', 'Awesome!'];
            this.toStateIntent('StartQuizState', 'QuestionsIntent', {
                yes: answers.length > 1 ? (responses[Math.floor(Math.random() *
                    responses.length)]) : 'Okay!',
            });
        },
        NoIntent() {
            let answers = this.getSessionAttribute('answers');
            answers.push(0);
            this.setSessionAttribute('answers', answers);
            // if user has no EU data
            if (answers.length === 1) {
                this.toStatelessIntent('END',
                    `${Translations.RESPONSE_NO_GDPR}`);
            } else {
                let speech = answers_descriptions[answers.length - 1];
                this.toStateIntent('StartQuizState', 'QuestionsIntent',
                    {no: speech});
            }
        },
        RepeatIntent() {
            this.toStateIntent('StartQuizState', 'QuestionsIntent',
                {repeat: true});
        },
        HelpIntent() {
            this.toStateIntent('HelpState', 'HelpUser', false);
        },
        StopIntent() {
            let speech = Translations.STOP_MESSAGE;
            this.followUpState('HelpState').ask(speech, speech);
        },
        CancelIntent(){
            this.toStatelessIntent('END', Translations.CANCEL_MESSAGE)
        },
        Unhandled() {
            const speech = `${Translations.RESPONSE_UNHANDLED}`;
            this.ask(speech, speech);
        }
    },
    HelpState: {
        HelpUser(newSession) {
            const answers = this.getSessionAttribute('answers');
            let askMessage;
            if (newSession) {
                askMessage = `${Translations.ASK_MESSAGE_START}`;
            } else {
                askMessage = `${Translations.REPEAT_QUESTION_MESSAGE}<break time="0.5s"/>${Translations.STOP_MESSAGE}`;
            }
            let speech = `${Translations.HELP_MESSAGE} + ${askMessage}`;
            let rePrompt = `${Translations.HELP_REPROMPT} + ${askMessage}`;
            this.ask(speech, rePrompt);
        },
        RepeatIntent() {
            let newSession = !(this.getSessionAttribute('answers').length);
            this.toStateIntent('HelpState', 'HelpUser', newSession);
        },
        HelpIntent() {
            let newSession = !(this.getSessionAttribute('answers').length);
            this.toStateIntent('HelpState', 'HelpUser', newSession);
        },
        YesIntent() {
            const answersCount = this.getSessionAttribute('answers').length;
            if (answersCount) {
                this.toStateIntent('ResponseState', 'RepeatIntent');
            } else {
                this.toStateIntent('StartQuizState', 'QuestionsIntent', false);
            }
        },
        NoIntent() {
            console.log('HELPER => NO INTENT');
            this.toStatelessIntent('ResultIntent');
        },
        StopIntent() {
            let speech = Translations.STOP_MESSAGE;
            this.ask(speech, speech);
        },
        CancelIntent(){
            this.toStatelessIntent('END', Translations.CANCEL_MESSAGE)
        },
        END(data) {
            this.toStatelessIntent('END', data);
        },
    },
    Unhandled() {
        this.tell('Something went wrong, please start from beginning');
        this.toIntent('LAUNCH');
    },
    ResultIntent() {
        const result = {
            'poor': 'You probably need to find out a bit more about the GDPR! All businesses must comply if they collect or store personal data.',
            'average': 'You are somewhat prepared for the GDPR, but you still have some issues that you need to consider.',
            'good': 'That’s great, it looks like you are well on your way to being GDPR compliant. But you should look at the points where you are still lacking.',
            'best': 'Congratulations, you seem to have a good grasp of the main changes that GDPR will bring.',
        };
        // calculating final result
        let answers = this.getSessionAttribute('answers');
        let answersLength = answers.length;
        let right = 0;
        for (let i = 0; i < answersLength; i++) {
            if (answers[i]) {
                right++;
            }
        }

        let percentage = isNaN(right / answers.length * 100)? 0: right / answers.length * 100;

        let speech = 'You have scored ' + percentage +
            ' percentage,<break time="0.5s"/> ';

        if (percentage >= 80) {
            speech += result['best'];
        } else if (percentage >= 60) {
            speech += result['good'];
        } else if (percentage >= 40) {
            speech += result['average'];
        } else {
            speech += result['poor'];
        }
        //this.tell(speech);
        this.toStatelessIntent('END', speech);
    },
    END(data) {
        let speech = (data ? data + ' ' : '') + 'Thank you.';
        this.tell(speech, {shouldEndSession: true});
    },
});

module.exports.app = app;
