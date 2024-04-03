/// <reference lib="dom" />
/// <reference lib="dom" />
const video = document.getElementById("video");
const canvas = document.createElement("canvas");
const ocrResult = document.getElementById("ocr-result");
const captureBtn = document.getElementById("capture-btn");
const startBtn = document.getElementById("start-btn");

// Access the camera and stream video
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video!.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing the camera: ", err);
  });

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
