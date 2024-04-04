/// <reference lib="dom" />
const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.createElement("canvas");
const ocrResult = document.getElementById("ocr-result");
const captureBtn = document.getElementById("capture-btn");
const startBtn = document.getElementById("start-btn");
const switchCameraBtn = document.getElementById("switch-camera-btn"); // Reference to the switch camera button

let mediaStream: MediaStream; // Variable to store the active media stream
let newFacingMode = "user";
let stopAnim = false;
let worker;

// MAIN

// Capture image from video stream
Tesseract.createWorker("eng").then((res: any) => worker = res);
// Start the camera when the page loads
startCamera();

//END

// Access the camera and stream video
async function startCamera(props = { video: { facingMode: "environment" } }) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(props);
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    video!.srcObject! = mediaStream;
  } catch (err) {
    console.error("Error accessing the camera: ", err);
  }
}

// Function to switch between front and back cameras
async function switchCamera() {
  // Stop the current stream
  mediaStream.getTracks().forEach((track) => track.stop());

  // Toggle between front and back camera
  newFacingMode = newFacingMode === "user" ? "environment" : "user";

  // Start the new stream with the updated facing mode
  await startCamera({ video: { facingMode: newFacingMode } });
}

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

captureBtn.onclick = async () => {
  stopAnim = true;
  startBtn.innerText = "Start";
  await recognize();
};

switchCameraBtn.onclick = async () => {
  await switchCamera();
};
