/// <reference lib="dom" />
const video = document.getElementById("video");
const canvas = document.createElement("canvas");
const ocrResult = document.getElementById("ocr-result");
const captureBtn = document.getElementById("capture-btn");
const startBtn = document.getElementById("start-btn");
const switchCameraBtn = document.getElementById("switch-camera-btn"); // Reference to the switch camera button

let mediaStream; // Variable to store the active media stream

// Access the camera and stream video
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = mediaStream;
  } catch (err) {
    console.error("Error accessing the camera: ", err);
  }
}

// Function to switch between front and back cameras
async function switchCamera() {
  // Stop the current stream
  mediaStream.getTracks().forEach((track) => track.stop());

  // Toggle between front and back camera
  const facingMode = video.srcObject?.getVideoTracks()[0].getSettings()
    .facingMode;
  const newFacingMode = facingMode === "user" ? "environment" : "user";

  // Start the new stream with the updated facing mode
  await startCamera({ video: { facingMode: newFacingMode } });
}

// Capture image from video stream
const worker = await Tesseract.createWorker("eng");

let stopAnim = false;

async function recognize() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert captured image to base64
  const imageData = canvas.toDataURL("image/png");

  const ret = await worker.recognize(imageData);
  ocrResult.value = ret.data.text;

  if (!stopAnim) requestAnimationFrame(recognize);
}

startBtn.onclick = () => {
  if (startBtn.innerText === "Start") {
    stopAnim = false;
    requestAnimationFrame(recognize);
    startBtn.innerText = "Stop";
  } else {
    stopAnim = true;
    startBtn.innerText = "Start";
  }
};

captureBtn.onclick = () => {
  stopAnim = true;
  startBtn.innerText = "Start";
  recognize();
};

switchCameraBtn.onclick = async () => {
  await switchCamera();
};

// Start the camera when the page loads
startCamera();
