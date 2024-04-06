// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";
const video = document.getElementById("video")! as HTMLVideoElement;
const canvas = document.createElement("canvas");
const ocrResult = document.getElementById("ocr-result")! as HTMLTextAreaElement;
const captureBtn = document.getElementById("capture-btn")!;
const startBtn = document.getElementById("start-btn")!;
const switchCameraBtn = document.getElementById("switch-camera-btn")!; // Reference to the switch camera button

let mediaStream: MediaStream; // Variable to store the active media stream
let facingMode = "environment";
let stopAnim = false;
let worker: TesseractWorker;

// MAIN
// Function to show loading spinner
function showLoadingSpinner() {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  document.body.appendChild(spinner);
}

// Function to hide loading spinner
function hideLoadingSpinner() {
  const spinner = document.querySelector(".spinner");
  if (spinner) {
    spinner.remove();
  }
}
// Capture image from video stream
createWorker("eng").then((res: any) => worker = res);
// Start the camera when the page loads
startCamera(facingMode);

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

  video.pause();
  showLoadingSpinner(); // Show loading spinner when capture button is clicked

  await recognize(); // Wait for recognition to finish

  hideLoadingSpinner(); // Hide loading spinner after recognition is done
  video.play();
};
switchCameraBtn.onclick = async () => {
  stopAnim = true;
  startBtn.innerText = "Start";
  await switchCamera();
};
//END

// Access the camera and stream video
async function startCamera(mode: any) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
    });
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
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
  facingMode = facingMode === "user" ? "environment" : "user";

  // Start the new stream with the updated facing mode
  await startCamera(facingMode);
}

async function recognize() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert captured image to base64
  const imageData = canvas.toDataURL("image/png");

  const ret = await worker.recognize(imageData);
  ocrResult.value = ret.data.text;

  if (!stopAnim) requestAnimationFrame(recognize);
}
