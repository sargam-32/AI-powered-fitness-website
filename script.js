// for chatbot
let prompt = document.querySelector(".prompt");
let chatbtn = document.querySelector(".input-area button");
let chating = document.querySelector("#ai-nav");
let chatContainer = document.querySelector(".chat-container");
let chatbox = document.querySelector(".chat-box");
let h1 = document.querySelector(".h1");
let userMessage = "";

let pchatbot = document.querySelector("#pchatbot");
chating.addEventListener("click", () => {
  if (pchatbot.style.display === "none") {
    pchatbot.style.display = "block"; // Show chatbot
  } else {
    pchatbot.style.display = "none"; // Hide chatbot
  }
});

let audio = new Audio("pop-up-something-160353.mp3"); // Replace with your actual sound URL

chating.addEventListener("click", () => {
  audio.play(); // Play the sound on click
});

chating.addEventListener("click", () => {
  chatbox.classList.toggle("active-chat-box");
});

let Api_url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyATl5TbIUx1QJzbi3kmdgNiP8kipEOCxkc";

async function generateApiResponse(aiChatBox) {
  const textElement = aiChatBox.querySelector(".text");
  try {
    const response = await fetch(Api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${userMessage} in 10 words` }],
          },
        ],
      }),
    });
    const data = await response.json();
    const apiResponse = data?.candidates[0].content.parts[0].text.trim();
    textElement.innerText = apiResponse;
  } catch (error) {
    console.log(error);
  } finally {
    aiChatBox.querySelector(".loading").style.display = "none";
  }
  scrollToBottom();
}

function createChatBox(html, className) {
  const div = document.createElement("div");
  div.classList.add(className);
  div.innerHTML = html;
  return div;
}

function showLoading() {
  const html = `<p class="text"></p>
        <img src="load.gif" class="loading" width="40px">`;
  let aiChatBox = createChatBox(html, "ai-chatbox");
  chatContainer.appendChild(aiChatBox);
  generateApiResponse(aiChatBox);
  scrollToBottom();
}

chatbtn.addEventListener("click", () => {
  h1.style.display = "none";
  userMessage = prompt.value;
  addUserMessage(userMessage);
  prompt.value = "";
  setTimeout(showLoading, 500);
});

// Function to add user's message
function addUserMessage(message) {
  const html = `<p class="text">${message}</p>`;
  let userChatBox = createChatBox(html, "user-chatbox");
  chatContainer.appendChild(userChatBox);
  scrollToBottom();
}

// Function to add predefined question buttons inside the chat
function addQuestionButtons() {
  let buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  let queries = [
    {
      text: "Do you have personal trainers?",
      response:
        "Yes! Our certified trainers can help you with personalized workout plans.",
    },
    {
      text: "What are your operating hours?",
      response: "Our gym is open from 5 AM to 11 PM every day.",
    },
    {
      text: "What is your contact information",
      response: "Yes, we have special holiday hours! On major holidays.",
    },
    {
      text: "Where are you located?",
      response:
        "You can reach us at: 📍 Address: [Gym’s Address]📞 Phone: [Gym Phone Number]📧 Email: [Gym Email]Feel free to call or email us for any inquiries. We’re happy to help!",
    },
    {
      text: "Do you have holiday hours?",
      response:
        "Our gym is located at xyz. Visit us anytime during our working hours!",
    },
    {
      text: "How much is the gym membership",
      response: "We offer monthly, quarterly, and yearly plans.",
    },
    {
      text: "What amenities do you offer?",
      response: "We provide lockers and showers for all members.",
    },
    {
      text: "Are there group classes available?",
      response: "Yes, we offer yoga, Zumba, HIIT, and spinning classes daily.",
    },
  ];

  queries.forEach((query) => {
    let button = document.createElement("button");
    button.innerText = query.text;
    button.classList.add("green-button");
    button.addEventListener("click", () => {
      addUserMessage(query.text);
      setTimeout(() => {
        let chatBox = createChatBox(
          `<p class="text">${query.response}</p>`,
          "ai-chatbox"
        );
        chatContainer.appendChild(chatBox);
        scrollToBottom();
      }, 500);
    });
    buttonContainer.appendChild(button);
  });

  chatContainer.appendChild(buttonContainer);
}

// Add buttons when chatbox opens
chating.addEventListener("click", () => {
  if (!document.querySelector(".button-container")) {
    addQuestionButtons();
  }
});

// Function to scroll chat to the bottom
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// virtual assistant

let ai = document.querySelector(".virtual-assistant img ");
let speakpage = document.querySelector(".speak-page ");
let content = document.querySelector(".speak-page h1 ");
let closeicon = document.querySelector("#closespeak ");

closeicon.addEventListener("click", () => {
  speakpage.style.display = "none";
});
// function wishMe() {
//     let day = new Date();
//     let hours = day.getHours();
//     if (hours >= 0 && hours < 12) {
//       speak("Good Morning , how can i help you..?");
//     } else if (hours >= 12 && hours < 16) {
//       speak("Good Afternoon , how can i help you..? ");
//     } else {
//       speak("Good evening , how can i help you..?");
//     }
//   }
//    window.addEventListener("load", () => {
//      wishMe();
//    })

//

function wishMe() {
  let day = new Date();
  let hours = day.getHours();
  if (hours >= 0 && hours < 12) {
    speak(
      "Good Morning,  welcome to fiitthub gym and mental health    ,   Your AI guide is ready to assist you . how can i help you"
    );
  } else if (hours >= 12 && hours < 16) {
    speak(
      "Good Afternoon, welcome to fiitthub gym and mental health    ,   Your AI guide is ready to assist you . how can i help you"
    );
  } else {
    speak(
      "Good Evening,  welcome to fiitthub gym and mental health    ,   Your AI guide is ready to assist you . how can i help you"
    );
  }
}

window.addEventListener("load", () => {
  // Check if the page has already been wished in this session
  if (!sessionStorage.getItem("hasBeenWished")) {
    wishMe(); // Wish the user
    sessionStorage.setItem("hasBeenWished", "true"); // Set flag so it won't run again in this session
  }
});

// ✅ Speak Function

function speak(text) {
  let text_speak = new SpeechSynthesisUtterance(text);
  text_speak.rate = 0.9;
  text_speak.pitch = 1;
  text_speak.volume = 1;
  text_speak.lang = "en-US";
  window.speechSynthesis.speak(text_speak);
}

// ✅ Initialize Speech Recognition
let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-US";

let isMicRunning = false;

function startMic() {
  if (!isMicRunning) {
    console.log("🎤 Starting Mic...");
    try {
      recognition.start();
      isMicRunning = true;
    } catch (e) {
      console.error("Mic Start Error:", e);
    }
  }
}

recognition.onend = () => {
  console.log("🔄 Mic Stopped, Restarting...");
  isMicRunning = false;
  setTimeout(() => {
    try {
      recognition.stop();
      startMic();
    } catch (e) {
      console.error("Mic Restart Error:", e);
    }
  }, 1000);
};

recognition.onresult = (event) => {
  let transcript = event.results[event.resultIndex][0].transcript
    .trim()
    .toLowerCase();
  console.log("🎤 User Said:", transcript);
  takeCommand(transcript);
};

document.addEventListener(
  "click",
  () => {
    startMic();
  },
  { once: true }
);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden && !isMicRunning) {
    console.log("🎤 Restarting Mic After Tab Switch...");
    startMic();
  }
});

function takeCommand(message) {
  message = message.toLowerCase(); // Normalize message

  // Core UI Commands
  if (message.includes("open") && message.includes("chat")) {
    speak("Okay.");
    chatbox.classList.add("active-chat-box");
  } else if (message.includes("close") && message.includes("chat")) {
    speak("Okay.");
    chatbox.classList.remove("active-chat-box");

  // Workout Page Commands
  } else if (message.includes("zumbo")) {
    speak("Okay.");
    window.open("zumbo.html", "_self");
  } else if (message.includes("leg")) {
    speak("Okay.");
    window.open("leg.html", "_self");
  } else if (message.includes("biceps") || message.includes("triceps")) {
    speak("Okay.");
    window.open("biceps.html", "_self");
  } else if (message.includes("shoulder")) {
    speak("Okay.");
    window.open("shoulder.html", "_self");
  } else if (message.includes("home")) {
    speak("Okay.");
    window.open("index.html#home", "_self");
  } else if (message.includes("open workout")) {
    speak("Okay.");
    window.open("index.html#workout", "_self");
  } else if (message.includes("transformation") || message.includes("diet")) {
    speak("Okay.");
    window.open("index.html#diet", "_self");
  } else if (message.includes("contact")) {
    speak("Okay.");
    window.open("index.html#contact", "_self");

  // BMI and Calculators
  } else if (message.includes("bmi")) {
    speak("Okay. Please enter your height and weight.");
    window.open("index.html#calculate", "_self");
  } else if (message.includes("calories") && message.includes("eat")) {
    speak("Let me open a calculator for you.");
    window.open("diet.html", "_self");

  // Yoga & Stretching
  } else if (message.includes("open yoga") || message.includes("yoga routine") || message.includes("yoga workout")) {
    speak("opening a relaxing yoga routine for you.");
    window.open("yoga.html", "_self");
  } else if (message.includes("open stretching") || message.includes("stretching workout") || message.includes("stretch routine")) {
    speak("sure, let's open a good stretching workout.");
    window.open("streching.html", "_self");

  // Weight Loss
  } else if (
    message.includes("open weight loss") ||
    (message.includes("suggest") && message.includes("workout") && message.includes("loss")) ||
    message.includes("lose weight") ||
    message.includes("fat loss")
  ) {
    speak("Opening effective workouts to help you lose weight.");
    window.open("lose.html", "_self");

  // Weight Gain
  } else if (
    message.includes("open weight gain") ||
    (message.includes("gain") && message.includes("weight")) ||
    (message.includes("suggest") && message.includes("workout") && message.includes("gain"))
  ) {
    speak("opening healthy routines to help you gain weight.");
    window.open("gain.html", "_self");

  // General Knowledge / FAQ
  } else if (message.includes("how are you")) {
    speak("I’m doing well, thanks! How about you?");
  } else if (message.includes("who are you")) {
    speak("I am an AI-powered fitness virtual assistant, created by Sargam ma'am. What can I help you with?");
  } else if (message.includes("what is bmi")) {
    speak("BMI stands for Body Mass Index. It's a measure of body fat based on your height and weight.");
  } else if (message.includes("strength training")) {
    speak("Strength training involves exercises that improve muscle strength and endurance, like lifting weights or bodyweight workouts.");
  } else if (message.includes("workout at home")) {
    speak("Absolutely! Home workouts can be very effective with bodyweight exercises, resistance bands, or simple equipment.");
  } else if (message.includes("best time to workout")) {
    speak("The best time to work out is whenever you can stay consistent. Morning or evening — both work great.");
  } else if (message.includes("belly fat")) {
    speak("Losing belly fat involves regular cardio, strength training, a healthy diet, and good sleep.");
  } else if (message.includes("balanced diet")) {
    speak("A balanced diet includes proteins, carbs, fats, vitamins, and minerals in the right proportions.");
  } else if (message.includes("how much water") || message.includes("drink water")) {
    speak("On average, aim for 2 to 3 liters a day, depending on your activity level and body size.");
  } else if (message.includes("benefits of exercise")) {
    speak("Exercise boosts your energy, improves mood, strengthens your body, and reduces health risks.");
  } else if (message.includes("fitness plan") || message.includes("help me")) {
    speak("Sure! I can recommend workouts, track your progress, and keep you motivated.");

  // Fallback
  } else {
    speak("I'm not sure how to help with that yet.");
  }
}



// let startBtn = document.getElementById("startBtn");
// let restartBtn = document.getElementById("restartBtn");
// let quitBtn = document.getElementById("quitBtn");
// let pauseBtn = document.getElementById("pauseBtn");
// let resumeBtn = document.getElementById("resumeBtn");
// let skipBtn = document.getElementById("skipBtn");
// let pauseOverlay = document.getElementById("pauseOverlay");
// let timer = document.getElementById("timer");
// let timerCircle = document.getElementById("timerCircle");
// let exerciseImage = document.getElementById("exerciseImage");
// let whistleSound = new Audio("referee-whistle-blow-gymnasium-6320.mp3");
// let bellSound = new Audio("bell-98033.mp3");

// let exercises = [
//   "jumpingjacks.gif",
//   "pushups.gif",
//   "kneepushup.gif",
//   "pushup rotation.gif",
//   "pushup-variation.gif",
//   "Decline-Push-Up.gif",
//   "burpees.gif",
//   "armcircle.gif",
//   "cobra stretch.gif",
//   "cheststretch.gif",
// ];

// let currentExercise = 0;
// let countdownInterval, exerciseInterval, restInterval;
// let paused = false;
// let remainingTime = 0;
// let currentCallback;

// startBtn.addEventListener("click", startWorkout);
// restartBtn.addEventListener("click", startWorkout);
// quitBtn.addEventListener("click", () => location.reload());
// pauseBtn.addEventListener("click", pauseWorkout);
// resumeBtn.addEventListener("click", resumeWorkout);
// skipBtn.addEventListener("click", skipExercise);

// function startWorkout() {
//   clearAllIntervals();
//   currentExercise = 0;
//   startBtn.style.display = "none";
//   restartBtn.style.display = "block";
//   quitBtn.style.display = "block";
//   skipBtn.style.display = "block";
//   pauseBtn.style.display = "block";
//   resumeBtn.style.display = "none";
//   timerCircle.style.display = "flex";

//   exerciseImage.src = exercises[currentExercise];

//   startCountdown(10, "Ready to go the next 60 seconds (jumping jacks)", () => {
//     startExercise(60, "jumping jacks", () => {
//       startRest(15);
//     });
//   });
// }

// function startCountdown(seconds, message, callback) {
//   let count = seconds;
//   timer.innerText = count;
//   speak(message);
//   currentCallback = callback;

//   countdownInterval = setInterval(() => {
//     if (paused) return;
//     if (count > 0) timer.innerText = count;
//     if (count === 3) speak("3");
//     if (count === 2) speak("2");
//     if (count === 1) speak("1");
//     count--;
//     if (count < 0) {
//       clearInterval(countdownInterval);
//       callback();
//     }
//   }, 1000);
// }

// function startExercise(seconds, name, callback) {
//   exerciseImage.src = exercises[currentExercise];
//   speak("Start");
//   whistleSound.play();
//   speak(`${seconds} seconds ${name}`);

//   let count = seconds;
//   timer.innerText = count;
//   currentCallback = () => startExercise(count, name, callback);

//   exerciseInterval = setInterval(() => {
//     if (paused) return;
//     if (count > 0) timer.innerText = count;
//     if (count === 30) speak("Half the time");
//     if (count === 3) speak("3");
//     if (count === 2) speak("2");
//     if (count === 1) speak("1");
//     count--;
//     if (count < 0) {
//       clearInterval(exerciseInterval);
//       callback();
//     }
//   }, 1000);
// }

// function startRest(seconds) {
//   let nextExercise = getExerciseName(currentExercise + 1);
//   speak(`Take a rest for the next 15 seconds, next exercise: ${nextExercise}`);

//   let count = seconds;
//   timer.innerText = count;
//   currentCallback = () => startExercise(60, nextExercise, startRest);

//   restInterval = setInterval(() => {
//     if (paused) return;
//     if (count > 0) timer.innerText = count;
//     if (count === 15) bellSound.play();
//     if (count === 3) speak("3");
//     if (count === 2) speak("2");
//     if (count === 1) speak("1");
//     count--;
//     if (count < 0) {
//       clearInterval(restInterval);
//       currentExercise++;
//       if (currentExercise >= exercises.length) {
//         endWorkout();
//       } else {
//         startExercise(60, nextExercise, startRest);
//       }
//     }
//   }, 1000);
// }

// function pauseWorkout() {
//   paused = true;
//   clearAllIntervals();
//   resumeBtn.style.display = "block";
//   pauseOverlay.style.display = "block";
// }

// function resumeWorkout() {
//   paused = false;
//   resumeBtn.style.display = "none";
//   pauseOverlay.style.display = "none";
//   if (currentCallback) currentCallback();
// }

// function skipExercise() {
//   clearAllIntervals();
//   if (currentExercise >= exercises.length - 1) {
//     endWorkout();
//     return;
//   }
//   currentExercise++;
//   let nextExerciseName = getExerciseName(currentExercise);
//   startExercise(60, nextExerciseName, () => startRest(15));
// }

// function clearAllIntervals() {
//   clearInterval(countdownInterval);
//   clearInterval(exerciseInterval);
//   clearInterval(restInterval);
// }

// function speak(text) {
//   let speech = new SpeechSynthesisUtterance(text);
//   speech.rate = 1;
//   speech.pitch = 1;
//   speech.volume = 1;
//   speech.lang = "en-US";
//   window.speechSynthesis.speak(speech);
// }

// function getExerciseName(index) {
//   if (index >= exercises.length) return "Workout Complete";
//   return exercises[index].split(".")[0];
// }

// function endWorkout() {
//   speak("Workout complete! Good job!");
//   timer.innerText = "Done!";

//   startBtn.style.display = "block";
//   restartBtn.style.display = "none";
//   quitBtn.style.display = "none";
//   skipBtn.style.display = "none";
//   pauseBtn.style.display = "none";
//   resumeBtn.style.display = "none";
//   timerCircle.style.display = "none";
// }

// // for bmi
function bmi() {
  var result = document.getElementById("result");
  var cm = document.getElementById("height");
  var kg = document.getElementById("weight");

  if (cm.value === "" || kg.value === "") {
    result.textContent = "Fill in the Height and Weight";
    setTimeout(() => {
      result.textContent = "";
    }, 3000);
  } else {
    var bmi = kg.value / (((cm.value / 100) * cm.value) / 100);
    var total = bmi.toFixed(2);
    if (bmi < 18.5) {
      result.textContent = `Your BMI is ${total} and you are skinny`;
    } else if (bmi < 25) {
      result.textContent = `Your BMI is ${total} and you are healthy`;
    } else {
      result.textContent = `Your BMI is ${total} and you are overweight`;
    }
    setTimeout(() => {
      cm.value = ""; // Clears height input
      kg.value = ""; // Clears weight input
      result.textContent = ""; // Clears result message
    }, 5000);
  }
}

// for animation

gsap.from("#about .cols .box img", {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 1,
  scrollTrigger: {
    trigger: "#about",
    scroller: "body",
    // markers: true,
    start: "top 70%",
    end: "top 65%",
    scrub: 3,
  },
});

gsap.from(".boxes img", {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 1,
  scrollTrigger: {
    trigger: ".boxes",
    scroller: "body",
    // markers: true,
    start: "top 70%",
    end: "top 65%",
    scrub: 3,
  },
});

// fixed navbar

window.addEventListener("scroll", function () {
  var nav = document.querySelector(".navbar");
  nav.classList.toggle("sticky", window.scrollY > 0);
});

// for calorie calculator
function calo() {
  var hdiet = document.getElementById("hi");
  var wdiet = document.getElementById("we");
  var age = document.getElementById("age");
  var finalresult = document.getElementById("result-cal");
  var genderSelect = document.getElementById("gender");

  // Validate input fields
  if (!hdiet.value || !wdiet.value || !age.value || !genderSelect.value) {
    finalresult.textContent = "Fill in Height, Weight, Age, and Gender";
    setTimeout(() => {
      finalresult.textContent = "";
    }, 3000);
    return;
  }

  var h = parseFloat(hdiet.value);
  var w = parseFloat(wdiet.value);
  var a = parseInt(age.value);
  var genderValue = genderSelect.value;

  // Check for valid numbers
  if (isNaN(h) || isNaN(w) || isNaN(a)) {
    finalresult.textContent = "Please enter valid numbers.";
    setTimeout(() => {
      finalresult.textContent = "";
    }, 3000);
    return;
  }

  // Calculate BMR (Basal Metabolic Rate)
  var bmr;
  if (genderValue === "male") {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  }

  // Assume light activity multiplier
  var calor = bmr * 1.4;

  // Display result
  finalresult.innerHTML = `Your Daily Calorie Intake: <strong>${calor.toFixed(
    2
  )}</strong>`;
}

// Function to clear all fields
function clearCalo() {
  document.getElementById("result-cal").innerHTML = "";
  document.getElementById("hi").value = "";
  document.getElementById("we").value = "";
  document.getElementById("age").value = "";
  document.getElementById("gender").selectedIndex = 0; // Reset dropdown selection
}
