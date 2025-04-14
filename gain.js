let score = 0;
let capture, posenet, singlePose, skeleton;
let workoutStarted = false;
let bodyVisible = false;
let lastInstructionTime = 0;
let bodyCheckInterval, postureCheckInterval;

function setup() {    
  let w = 550,
    h = 442;
  createCanvas(w, h);
  capture = createCapture(VIDEO);
  capture.size(w, h);
  capture.hide();

  posenet = ml5.poseNet(capture, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function modelLoaded() {
  console.log("✅ PoseNet Model Loaded");
  bodyCheckInterval = setInterval(checkBodyVisibility, 15000); // 15 seconds
}

function receivedPoses(poses) {
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;

    if (isFullBodyVisible(singlePose)) {
      bodyVisible = true;
    } else {
      bodyVisible = false;
    }
  } else {
    bodyVisible = false;
  }
}
let visibilityWarningCount = 0;

function checkBodyVisibility() {
  if (!workoutStarted) return;

  if (!singlePose || !isFullBodyVisible(singlePose)) {
    if (!window.speechSynthesis.speaking) {
      speak("Your whole body is not visible. Please adjust your position.");
    }
    bodyVisible = false;
  } else {
    bodyVisible = true;
  }
}

function isFullBodyVisible(pose) {
  let requiredParts = ["leftAnkle", "rightAnkle", "leftWrist", "rightWrist", "nose"];
  for (let part of requiredParts) {
    if (!pose[part] || pose[part].confidence < 0.4) {
      return false;
    }
  }
  return true;
}

function draw() {
  image(capture, 0, 0, width, height);
  if (singlePose) {
    fill(255, 0, 0);
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      let x = map(singlePose.keypoints[i].position.x, 0, capture.width, 0, width);
      let y = map(singlePose.keypoints[i].position.y, 0, capture.height, 0, height);
      ellipse(x, y, 10);
    }
  }
}

function speak(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  let speech = new SpeechSynthesisUtterance(text);
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

function checkJumpingJackPosture() {
  if (!singlePose) return;

  let leftWrist = singlePose.leftWrist;
  let rightWrist = singlePose.rightWrist;
  let leftAnkle = singlePose.leftAnkle;
  let rightAnkle = singlePose.rightAnkle;
  let nose = singlePose.nose;

  let handHeight = (leftWrist.y + rightWrist.y) / 2;
  let ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
  let currentTime = millis();

  let requiredConfidence = 0.4;

  if (
    leftWrist.confidence < requiredConfidence ||
    rightWrist.confidence < requiredConfidence ||
    leftAnkle.confidence < requiredConfidence ||
    rightAnkle.confidence < requiredConfidence ||
    nose.confidence < requiredConfidence
  ) {
    if (currentTime - lastInstructionTime > 5000) {
      lastInstructionTime = currentTime;
    }
    return;
  }

  let handsUp = handHeight < nose.y;
  let legsApart = ankleWidth > 100;
  let correctPosture = handsUp && legsApart;

  if (correctPosture) {
    score++;
    console.log(`✅ Good posture! Score: ${score}`);
  } else {
    if (currentTime - lastInstructionTime > 5000) {
      if (!handsUp && !legsApart) {
        speak("Raise your hands and spread your legs.");
      } else if (!handsUp) {
        speak("Raise your hands above your head.");
      } else if (!legsApart) {
        speak("Spread your legs wider.");
      } else {
        speak("Wrong pose. Try again.");
      }
      lastInstructionTime = currentTime;
    }
  }
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
  "jumpingjacks.gif",
  "armcircle.gif",
  "pushups.gif",
  "squats.gif",
  "lunges.gif",
  "plank.gif",
  "glute bridge.gif",
  "superman.jpg",
  "cow pose.gif",
  "child pose.gif",
  "shoulderstretch.gif"
];

const feedbacks = {
  jumpingjacks: [
    "Keep your arms fully extended above your head.",
    "Land softly on your toes to protect your knees."
  ],
  armcircle: [
    "Make slow, controlled circular motions.",
    "Engage your shoulders and keep arms straight."
  ],
  pushups: [
    "Keep your body in a straight line from head to heels.",
    "Lower your body until your chest almost touches the ground."
  ],
  squats: [
    "Push your hips back and keep your chest lifted.",
    "Don't let your knees go past your toes."
  ],
  lunges: [
    "Step forward and lower your hips until both knees are bent at 90 degrees.",
    "Keep your upper body straight and don't let your front knee pass your toes."
  ],
  plank: [
    "Keep your body in a straight line and engage your core.",
    "Don't let your hips drop or rise too much."
  ],
  glutebridge: [
    "Push through your heels and lift your hips toward the ceiling.",
    "Squeeze your glutes at the top for better activation."
  ],
  superman: [
    "Lift both arms and legs simultaneously and hold.",
    "Keep your gaze downward and engage your back muscles."
  ],
  cowpose: [
    "Arch your back and lift your chest for a deep stretch.",
    "Inhale as you tilt your pelvis back and look up."
  ],
  childpose: [
    "Sit back on your heels and stretch your arms forward.",
    "Breathe deeply and relax into the pose."
  ],
  shoulderstretch: [
    "Gently pull your elbow across your chest.",
    "Keep your shoulders relaxed and breathe deeply."
  ]
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

function startWorkout() {
  clearAllIntervals();
  clearInterval(postureCheckInterval);
  postureCheckInterval = setInterval(checkJumpingJackPosture, 2000);

  workoutStarted = true;
  currentExercise = 0;

  startBtn.style.display = "none";
  restartBtn.style.display = "block";
  quitBtn.style.display = "block";
  skipBtn.style.display = "block";
  pauseBtn.style.display = "block";
  resumeBtn.style.display = "none";
  timerCircle.style.display = "flex";

  exerciseImage.src = exercises[currentExercise];

  startCountdown(10, "Ready to go the next 60 seconds (jumping jacks)", () => {
    startExercise(60, "jumping jacks", () => {
      startRest(15);
    });
  });
}

function startCountdown(seconds, message, callback) {
  let count = seconds;
  timer.innerText = count;
  speak(message);
  currentCallback = callback;

  countdownInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count;
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
  let exerciseBaseName = getExerciseName(currentExercise);
  let tips = feedbacks[exerciseBaseName];
  visibilityWarningCount = 0;  

  speak("Start");

  if (tips && tips.length === 2) {
    speak(tips[0]);
    setTimeout(() => {
      speak("Half the time");
      speak(tips[1]);
    }, 30000);
    setTimeout(() => speak(tips[0]), 45000);
    setTimeout(() => speak(tips[1]), 55000);
  }

  let count = seconds;
  timer.innerText = count;
  currentCallback = () => startExercise(count, name, callback);

  exerciseInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count;
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
  let nextIndex = currentExercise + 1;
  if (nextIndex < exercises.length) {
    exerciseImage.src = exercises[nextIndex];
  }

  let nextExercise = getExerciseName(nextIndex);
  speak(`Take a rest for the next 15 seconds, next exercise: ${nextExercise}`);

  let count = seconds;
  timer.innerText = count;
  currentCallback = () => startExercise(60, nextExercise, startRest);

  restInterval = setInterval(() => {
    if (paused) return;
    timer.innerText = count;
    if (count === 15) bellSound.play();
    if ([3, 2, 1].includes(count)) speak(count.toString());
    count--;
    if (count < 0) {
      clearInterval(restInterval);
      currentExercise++;
      if (currentExercise >= exercises.length) {
        endWorkout();
      } else {
        startExercise(60, nextExercise, startRest);
      }
    }
  }, 1000);
}

function pauseWorkout() {
  paused = true;
  clearAllIntervals();
  resumeBtn.style.display = "block";
  pauseOverlay.style.display = "block";
}

function resumeWorkout() {
  paused = false;
  resumeBtn.style.display = "none";
  pauseOverlay.style.display = "none";
  if (currentCallback) currentCallback();
}

function skipExercise() {
  clearAllIntervals();
  if (currentExercise >= exercises.length - 1) {
    endWorkout();
    return;
  }
  currentExercise++;
  let nextExerciseName = getExerciseName(currentExercise);
  startExercise(60, nextExerciseName, () => startRest(15));
}

function clearAllIntervals() {
  clearInterval(countdownInterval);
  clearInterval(exerciseInterval);
  clearInterval(restInterval);
}

function getExerciseName(index) {
  if (index >= exercises.length) return "Workout Complete";
  return exercises[index].split(".")[0].replace(/\s/g, "");
}

function endWorkout() {
  clearInterval(postureCheckInterval);
  speak("Workout complete! Good job!");
  timer.innerText = "Done!";
  startBtn.style.display = "block";
  restartBtn.style.display = "none";
  quitBtn.style.display = "none";
  skipBtn.style.display = "none";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  timerCircle.style.display = "none";
}
