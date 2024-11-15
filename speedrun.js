// Helper function for delay
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to fetch the answer using OpenAI API
async function fetchAnswerFromLLM(question) {
    const apiKey = "0334229e8ccc48329d31675a9bd4717b"; // Replace with your OpenAI API key
    const endpoint = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4", // Adjust model if needed
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: question },
                ],
                max_tokens: 100,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        }
        console.error("No valid response from LLM:", data);
        return null;
    } catch (error) {
        console.error("Error fetching answer from LLM:", error);
        return null;
    }
}

// Function to handle MCQs
async function handleMCQs(questionText) {
    try {
        const answer = await fetchAnswerFromLLM(questionText);
        console.log("Fetched answer from LLM:", answer);

        if (!answer) {
            console.warn("No answer received for MCQ.");
            return;
        }

        const labels = document.querySelectorAll("label");
        for (let label of labels) {
            const labelText = label.textContent.trim();
            console.log("Checking label:", labelText);
            if (labelText.toLowerCase() === answer.toLowerCase()) {
                label.click();
                console.log("Clicked label:", labelText);
                return;
            }
        }

        console.warn("Answer not matched with any label.");
    } catch (error) {
        console.error("Error handling MCQs:", error);
    }
}

// Function to handle text areas
async function handleTextArea() {
    const textArea = document.querySelector("textarea");
    if (textArea) {
        const question = "Provide an appropriate response for a text-based question.";
        const answer = await fetchAnswerFromLLM(question);
        console.log("Fetched answer for text area:", answer);

        if (answer) {
            textArea.value = answer;
            textArea.dispatchEvent(new Event("input", { bubbles: true }));
            console.log("Text area filled with:", answer);
        }
    }
}

// Function to answer the current question
async function answerQuestion() {
    try {
        const questionElement = document.querySelector(".question-text");
        if (!questionElement) {
            console.warn("No question text element found.");
            return;
        }

        const questionText = questionElement.textContent.trim();
        console.log("Extracted question:", questionText);

        // Check for MCQs
        const hasMCQs = document.querySelectorAll("label").length > 0;
        if (hasMCQs) {
            console.log("MCQ detected. Handling MCQs...");
            await handleMCQs(questionText);
            return;
        }

        // Check for text areas
        const textArea = document.querySelector("textarea");
        if (textArea) {
            console.log("Text area detected. Handling text area...");
            await handleTextArea();
            return;
        }

        console.warn("No known question type detected.");
    } catch (error) {
        console.error("Error answering question:", error);
    }
}

// Function to move to the next screen
async function nextScreen() {
    return new Promise(async (resolve) => {
        const submitBtn = document.querySelector("#testSubmit");

        if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
            console.log("Submit button enabled, clicking...");
            await sleep(500);
            submitBtn.click();

            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.type === "childList") {
                        console.log("Next screen loaded.");
                        observer.disconnect();
                        resolve();
                        return;
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } else {
            console.warn("Submit button is disabled or not found.");
            resolve();
        }
    });
}

// Main loop to automate the process
async function main() {
    while (true) {
        try {
            const startButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "start");

            if (startButton) {
                console.log("Start button detected, clicking...");
                await sleep(500);
                startButton.click();
                await nextScreen();
                continue;
            }

            const continueButton = Array.from(document.querySelectorAll("button"))
                .find((button) => button.textContent.trim().toLowerCase() === "continue");

            if (continueButton) {
                console.log("Continue button detected, clicking...");
                await sleep(500);
                continueButton.click();
                await nextScreen();
                continue;
            }

            const submitBtn = document.querySelector("#testSubmit");
            if (submitBtn && !submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button detected, clicking...");
                await sleep(500);
                submitBtn.click();
                await nextScreen();
                continue;
            }

            if (submitBtn && submitBtn.classList.contains("disabledElement")) {
                console.log("Submit button is disabled, answering questions...");
                await answerQuestion();
            }

            await sleep(2000);
        } catch (error) {
            console.error("Error in main loop:", error);
        }
    }
}

// Start the script
main();
