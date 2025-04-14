let capture, posenet, singlePose;
let workoutStarted = false;
let bodyVisible = false;
let lastInstructionTime = 0;
let bodyCheckInterval, postureCheckInterval;
let score = 0;

function setup() {
  let w = 550, h = 442;
  createCanvas(w, h);
  capture = createCapture(VIDEO);
  capture.size(w, h);
  capture.hide();

  posenet = ml5.poseNet(capture, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function modelLoaded() {
  console.log("✅ PoseNet Loaded");
  bodyCheckInterval = setInterval(checkBodyVisibility, 15000);
}

function receivedPoses(poses) {
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    bodyVisible = isFullBodyVisible(singlePose);
  } else {
    bodyVisible = false;
  }
}

function isFullBodyVisible(pose) {
  const parts = ["leftAnkle", "rightAnkle", "leftWrist", "rightWrist", "nose"];
  return parts.every(p => pose[p] && pose[p].confidence > 0.4);
}

function checkBodyVisibility() {
  if (!workoutStarted) return;
  if (!singlePose || !isFullBodyVisible(singlePose)) {
    if (!speechSynthesis.speaking) {
      speak("Your whole body is not visible. Please adjust your position.");
    }
  }
}

function speak(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

// DOM Elements
const timer = document.getElementById("timer");
const timerCircle = document.getElementById("timerCircle");
const exerciseImage = document.getElementById("exerciseImage");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const skipBtn = document.getElementById("skipBtn");
const pauseOverlay = document.getElementById("pauseOverlay");

// Sounds
const whistleSound = new Audio("referee-whistle-blow-gymnasium-6320.mp3");
const bellSound = new Audio("bell-98033.mp3");

// Exercises and Feedbacks
const exercises = [
  "child pose.gif", "Tadasana.gif", "Uttanasana.gif", "adho-mukha.gif",
  "Virabhadrasana.gif", "Trikonasana.gif", "plank.gif",
  "Paschimottanasana.gif", "glute bridge.gif", "Balasana.gif"
];

const feedbacks = {
  "child pose": ["Rest your forehead gently on the mat.", "Breathe deeply and relax."],
  "Tadasana": ["Stand tall with aligned spine.", "Distribute weight evenly."],
  "Uttanasana": ["Hinge from hips, not waist.", "Let head hang loose."],
  "adho-mukha": ["Press heels down.", "Keep arms strong."],
  "Virabhadrasana": ["Front knee over ankle.", "Arms parallel to floor."],
  "Trikonasana": ["Extend arms fully.", "Avoid collapsing chest."],
  "plank": ["Keep body straight.", "Engage core muscles."],
  "Paschimottanasana": ["Reach from chest.", "Keep legs straight."],
  "glute bridge": ["Lift hips high.", "Relax your neck."],
  "Balasana": ["Rest forehead gently.", "Relax completely."],
};

let currentExercise = 0;
let paused = false;
let countdownInterval, exerciseInterval, restInterval;
let currentCallback;

startBtn.onclick = startWorkout;
restartBtn.onclick = startWorkout;
quitBtn.onclick = () => location.reload();
pauseBtn.onclick = pauseWorkout;
resumeBtn.onclick = resumeWorkout;
skipBtn.onclick = skipExercise;

function startWorkout() {
  clearAllIntervals();
  clearInterval(postureCheckInterval);
  postureCheckInterval = setInterval(() => {}, 2000); // Pose logic goes here

  workoutStarted = true;
  currentExercise = 0;

  startBtn.style.display = "none";
  restartBtn.style.display = "block";
  quitBtn.style.display = "block";
  skipBtn.style.display = "block";
  pauseBtn.style.display = "block";
  resumeBtn.style.display = "none";
  timerCircle.style.display = "flex";

  updateImage(currentExercise);
  startCountdown(10, "Ready to go the next 60 seconds", () => {
    startExercise(60, getExerciseName(currentExercise), () => startRest(15));
  });
}

function updateImage(index) {
  exerciseImage.src = exercises[index];
}

function getExerciseName(index) {
  return exercises[index].split(".")[0];
}

function startCountdown(seconds, message, callback) {
  speak(message);
  let count = seconds;
  timer.textContent = count;
  currentCallback = () => startCountdown(seconds, message, callback);

  countdownInterval = setInterval(() => {
    if (paused) return;
    if (count >= 0) timer.textContent = count;
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(countdownInterval);
      callback();
    }
  }, 1000);
}

function startExercise(seconds, name, callback) {
  updateImage(currentExercise);
  const tips = feedbacks[name] || [];
  speak("Start");

  if (tips.length === 2) {
    speak(tips[0]);
    setTimeout(() => {
      speak("Half the time");
      speak(tips[1]);
    }, 30000);
  }

  let count = seconds;
  timer.textContent = count;
  currentCallback = () => startExercise(seconds, name, callback);

  exerciseInterval = setInterval(() => {
    if (paused) return;
    if (count >= 0) timer.textContent = count;
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(exerciseInterval);
      callback();
    }
  }, 1000);
}

function startRest(seconds) {
  if (currentExercise + 1 >= exercises.length) {
    endWorkout();
    return;
  }

  updateImage(currentExercise + 1);
  const nextName = getExerciseName(currentExercise + 1);
  speak(`Take a ${seconds}-second rest. Next: ${nextName}`);
  let count = seconds;
  timer.textContent = count;
  currentCallback = () => startRest(seconds);

  restInterval = setInterval(() => {
    if (paused) return;
    if (count >= 0) timer.textContent = count;
    if (count === 15) bellSound.play();
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(restInterval);
      currentExercise++;
      startExercise(60, getExerciseName(currentExercise), () => startRest(15));
    }
  }, 1000);
}

function endWorkout() {
  clearAllIntervals();
  speak("Workout complete! Good job!");
  timer.textContent = "Done!";
  timerCircle.style.display = "none";
  restartBtn.style.display = "none";
  quitBtn.style.display = "none";
  skipBtn.style.display = "none";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  startBtn.style.display = "block";
}

function pauseWorkout() {
  paused = true;
  clearAllIntervals();
  pauseOverlay.style.display = "block";
  resumeBtn.style.display = "block";
}

function resumeWorkout() {
  paused = false;
  pauseOverlay.style.display = "none";
  resumeBtn.style.display = "none";
  if (currentCallback) currentCallback();
}

function skipExercise() {
  clearAllIntervals();
  if (currentExercise >= exercises.length - 1) {
    endWorkout();
    return;
  }
  currentExercise++;
  startExercise(60, getExerciseName(currentExercise), () => startRest(15));
}

function clearAllIntervals() {
  clearInterval(countdownInterval);
  clearInterval(exerciseInterval);
  clearInterval(restInterval);
}
