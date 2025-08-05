
// --- Elements ---
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');

// --- App State ---
const answers = {
    postalCode: null,
    adults: null,
    childrenCount: null,
    childrenGrades: [],
};

let questionQueue = [];
let currentChild = 1;

// --- Questions ---
const initialQuestions = [
    {
        key: 'postalCode',
        text: 'お住まいの郵便番号を教えてください。（例: 1234567）',
        type: 'text',
    },
    {
        key: 'adults',
        text: '今日は何人で来ましたか？（ご自身を含む大人の人数）',
        type: 'number',
        options: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        key: 'childrenCount',
        text: 'お子さんは何人来ていますか？',
        type: 'number',
        options: [0, 1, 2, 3, 4, 5, 6, 7],
    },
];

const childGradeQuestion = {
    key: 'childGrade',
    text: (number) => `お子さん ${number} 人目の学年を教えてください。`,
    type: 'choice',
    options: ['幼稚園・保育園', '小学校低学年', '小学校高学年', '中学校', '高校生', '未就学児', 'その他'],
};


// --- Functions ---

function displayQuestion(question) {
    questionElement.textContent = typeof question.text === 'function' ? question.text(currentChild) : question.text;
    optionsElement.innerHTML = '';

    switch (question.type) {
        case 'text':
            const input = document.createElement('input');
            input.type = 'tel'; // Use 'tel' for numeric keyboard on mobile
            input.pattern = '\d{7}';
            input.placeholder = '例: 1000001';
            optionsElement.appendChild(input);

            const nextButton = document.createElement('button');
            nextButton.textContent = '次へ';
            nextButton.onclick = () => {
                if (input.value.match(/^\d{7}$/)) {
                    handleAnswer(question.key, input.value);
                } else {
                    alert('ハイフンなし7桁の郵便番号を入力してください。');
                }
            };
            optionsElement.appendChild(nextButton);
            input.focus();
            break;

        case 'number':
        case 'choice':
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.onclick = () => handleAnswer(question.key, option);
                optionsElement.appendChild(button);
            });
            break;
    }
}

function handleAnswer(key, value) {
    if (key === 'childGrade') {
        answers.childrenGrades.push(value);
        currentChild++;
    } else {
        answers[key] = value;
    }

    if (key === 'childrenCount' && value > 0) {
        for (let i = 0; i < value; i++) {
            questionQueue.push(childGradeQuestion);
        }
    }

    if (questionQueue.length > 0) {
        const nextQuestion = questionQueue.shift();
        displayQuestion(nextQuestion);
    } else {
        submitAnswers();
    }
}

async function submitAnswers() {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzj3446mKaxDcQ6tAe5LDEFzINDpmc_pXgRdwpiqrCRY6gDxI4tXBD0fZTBvCUpq5oW/exec";
    questionContainer.innerHTML = '<p>回答を送信中です...</p>';

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(answers),
        });

        const result = await response.json();

        if (result.status === 'success') {
            questionContainer.innerHTML = `
            <img src="images/すいかっ娘。.jpg" alt="すいかっ娘。">
            <p>ご入力ありがとうございました！</p>
            <p>この画面をスタッフに見せてね！</p>
            <a href="https.ee/Q59ibyF" class="line-button" target="_blank" rel="noopener noreferrer">LINEで友だち登録</a>
        `;
        } else {
            questionContainer.innerHTML = `<p>送信に失敗しました。お手数ですが、もう一度お試しください。</p><p>エラー: ${result.message || '不明'}</p>`;
        }
    } catch (error) {
        questionContainer.innerHTML = `<p>送信中にエラーが発生しました。ネットワーク接続をご確認の上、もう一度お試しください。</p>`;
        console.error('Submit Error:', error);
    }
}

// --- Initialisation ---
function start() {
    questionQueue = [...initialQuestions];
    const firstQuestion = questionQueue.shift();
    displayQuestion(firstQuestion);
}

start();
