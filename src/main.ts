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
  await recognize();
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
  await startCamera({ video: { facingMode: facingMode } });
}

async function recognize() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert captured image to base64
  const imageData = canvas.toDataURL("image/png");

  const a = performance.now();
  const ret = await worker.recognize(imageData);
  const b = performance.now();
  alert(b - a);
  ocrResult.value = ret.data.text;

  if (!stopAnim) requestAnimationFrame(recognize);
}
