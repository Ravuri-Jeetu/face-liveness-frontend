import React, { useRef, useState, useEffect } from "react";

const BACKEND_URL = "https://backend-0wlp.onrender.com";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState("Loading camera...");
  const [streamStarted, setStreamStarted] = useState(false);

  // Start webcam video stream
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamStarted(true);
        setPrediction("Detecting...");
      } catch (err) {
        setPrediction("Error accessing camera");
        console.error(err);
      }
    }
    startCamera();
  }, []);

  // Capture frame and send to backend every ~1.5 seconds
  useEffect(() => {
    if (!streamStarted) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size same as video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get base64 image from canvas
      const base64Image = canvas.toDataURL("image/jpeg");

      // Send to backend
// Send to backend
fetch(`${BACKEND_URL}/predict`, {  // ✅ Added /predict
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ image: base64Image }),
})

        .then((res) => res.json())
        .then((data) => {
          if (data.prediction) {
            setPrediction(data.prediction);
          } else {
            setPrediction("No prediction");
          }
        })
        .catch((err) => {
          setPrediction("Error during prediction");
          console.error(err);
        });
    }, 1500);

    return () => clearInterval(interval);
  }, [streamStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Face Liveness Detection</h1>

      <div className="bg-black rounded-lg shadow-lg p-4">
        <video
          ref={videoRef}
          className="rounded-md"
          muted
          playsInline
          width="320"
          height="240"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div className="mt-6 text-xl font-semibold">
        Prediction: <span className="italic">{prediction}</span>
      </div>
    </div>
  );
}

export default App;
