let score = 0;
let capture, posenet, singlePose, skeleton;
let workoutStarted = false;
let bodyVisible = false;
let lastInstructionTime = 0;
let bodyCheckInterval, postureCheckInterval;
let visibilityWarningCount = 0;

function setup() {
  const canvas = createCanvas(550, 442);
  canvas.parent(document.body);
  capture = createCapture(VIDEO);
  capture.size(550, 442);
  capture.hide();
  posenet = ml5.poseNet(capture, () => {
    console.log("✅ PoseNet Model Loaded");
    bodyCheckInterval = setInterval(checkBodyVisibility, 15000);
  });
  posenet.on("pose", receivedPoses);
}

function draw() {
  image(capture, 0, 0);
  if (singlePose) {
    fill(255, 0, 0);
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      let x = singlePose.keypoints[i].position.x;
      let y = singlePose.keypoints[i].position.y;
      ellipse(x, y, 10);
    }
  }
}

function receivedPoses(poses) {
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
    bodyVisible = isFullBodyVisible(singlePose);
  } else {
    bodyVisible = false;
  }
}

function isFullBodyVisible(pose) {
  let requiredParts = ["leftAnkle", "rightAnkle", "leftWrist", "rightWrist", "nose"];
  return requiredParts.every(part => pose[part] && pose[part].confidence >= 0.4);
}

function checkBodyVisibility() {
  if (!workoutStarted) return;
  if (!singlePose || !isFullBodyVisible(singlePose)) {
    if (!window.speechSynthesis.speaking) {
      speak("Your whole body is not visible. Please adjust your position.");
    }
  }
}

function speak(text) {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  let speech = new SpeechSynthesisUtterance(text);
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// DOM + Timer + Workout Logic
let startBtn = document.getElementById("startBtn");
let restartBtn = document.getElementById("restartBtn");
let quitBtn = document.getElementById("quitBtn");
let pauseBtn = document.getElementById("pauseBtn");
let resumeBtn = document.getElementById("resumeBtn");
let skipBtn = document.getElementById("skipBtn");
let pauseOverlay = document.getElementById("pauseOverlay");
let timer = document.getElementById("timer");
let timerCircle = document.getElementById("timerCircle");
let exerciseImage = document.getElementById("exerciseImage");

let whistleSound = new Audio("referee-whistle-blow-gymnasium-6320.mp3");
let bellSound = new Audio("bell-98033.mp3");
let exercises = [
  "neck rotations.gif", "armcircle.gif", "standing-Rotation.gif",
  "Leg-Swings.gif", "Standing-Quadriceps-Stretch.gif", "seated-hamstring-stretch.gif",
  "side lunge.jpg", "Butterfly Stretch.jpg", "child pose.gif", "Supine Spinal Twist.jpg"
];

const feedbacks = {
  "neck rotations": ["Slowly rotate your neck in a full circle.", "Keep your shoulders relaxed and avoid quick movements."],
  "armcircle": ["Make slow, controlled circular motions with your arms.", "Keep your arms parallel to the floor."],
  "standing-rotation": ["Rotate your torso gently from side to side.", "Keep your core engaged and hips stable."],
  "leg-swings": ["Swing your leg forward and backward with control.", "Hold onto a wall or chair for balance."],
  "standing-quadriceps-stretch": ["Pull your foot toward your glutes while standing tall.", "Keep your knees close together."],
  "seated-hamstring-stretch": ["Reach toward your toes with a straight back.", "Keep your knees slightly bent if needed."],
  "side-lunge": ["Step to the side and bend one knee while keeping the other leg straight.", "Keep your chest lifted and back straight."],
  "butterfly-stretch": ["Bring the soles of your feet together and let your knees drop.", "Gently press your knees down with your elbows."],
  "child-pose": ["Sit back on your heels and stretch your arms forward.", "Breathe deeply and relax into the pose."],
  "supine-spinal-twist": ["Lie on your back and twist one knee across your body.", "Keep your shoulders flat on the floor."]
};

let currentExercise = 0;
let countdownInterval, exerciseInterval, restInterval;
let paused = false;
let currentCallback;

startBtn.addEventListener("click", startWorkout);
restartBtn.addEventListener("click", startWorkout);
quitBtn.addEventListener("click", () => location.reload());
pauseBtn.addEventListener("click", pauseWorkout);
resumeBtn.addEventListener("click", resumeWorkout);
skipBtn.addEventListener("click", skipExercise);

window.onload = () => {
  exerciseImage.src = exercises[0];
};

function getExerciseName(index) {
  if (index >= exercises.length) return "Workout Complete";
  return exercises[index].replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, "-");
}

function startWorkout() {
  clearAllIntervals();
  clearInterval(postureCheckInterval);
  postureCheckInterval = setInterval(() => {}, 2000); // Placeholder

  workoutStarted = true;
  currentExercise = 0;
  toggleButtons("start");

  exerciseImage.src = exercises[currentExercise];
  let name = getExerciseName(currentExercise);
  startCountdown(10, `Ready to go. Next: ${name}`, () => {
    startExercise(60, name, () => startRest(15));
  });
}

function startCountdown(seconds, message, callback) {
  let count = seconds;
  timer.innerText = count;
  speak(message);
  currentCallback = callback;
  countdownInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count > 0 ? count : 0;
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(countdownInterval);
      callback();
    }
  }, 1000);
}

function startExercise(seconds, name, callback) {
  exerciseImage.src = exercises[currentExercise];
  visibilityWarningCount = 0;
  let tips = feedbacks[name];
  speak("Start " + name.replace(/-/g, " "));

  if (tips) {
    setTimeout(() => speak(tips[0]), 3000);
    setTimeout(() => speak("Half the time. " + tips[1]), 30000);
    setTimeout(() => speak(tips[0]), 45000);
    setTimeout(() => speak(tips[1]), 55000);
  }

  let count = seconds;
  timer.innerText = count;
  currentCallback = () => startExercise(count, name, callback);

  exerciseInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count > 0 ? count : 0;
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(exerciseInterval);
      if (currentExercise >= exercises.length - 1) {
        endWorkout();
      } else {
        callback();
      }
    }
  }, 1000);
}

function startRest(seconds) {
  let nextExercise = getExerciseName(currentExercise + 1);
  exerciseImage.src = exercises[currentExercise + 1] || "";
  speak(`Rest for 15 seconds. Next: ${nextExercise}`);

  let count = seconds;
  timer.innerText = count;
  currentCallback = () => startExercise(60, nextExercise, startRest);

  restInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count > 0 ? count : 0;
    if (count === 15) bellSound.play();
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(restInterval);
      currentExercise++;
      startExercise(60, nextExercise, startRest);
    }
  }, 1000);
}

function endWorkout() {
  clearInterval(postureCheckInterval);
  clearAllIntervals();
  speak("Workout complete! Good job!");
  timer.innerText = "Done!";
  toggleButtons("end");
}

function pauseWorkout() {
  paused = true;
  clearAllIntervals();
  resumeBtn.style.display = "block";
  pauseOverlay.style.display = "flex";
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
  } else {
    currentExercise++;
    let name = getExerciseName(currentExercise);
    exerciseImage.src = exercises[currentExercise];
    startExercise(60, name, startRest);
  }
}

function clearAllIntervals() {
  clearInterval(countdownInterval);
  clearInterval(exerciseInterval);
  clearInterval(restInterval);
}

function toggleButtons(state) {
  startBtn.style.display = state === "start" ? "none" : "block";
  restartBtn.style.display = state === "end" ? "none" : "block";
  quitBtn.style.display = state === "end" ? "none" : "block";
  skipBtn.style.display = state === "end" ? "none" : "block";
  pauseBtn.style.display = state === "end" ? "none" : "block";
  resumeBtn.style.display = "none";
  timerCircle.style.display = state === "end" ? "none" : "flex";
}