
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Waiting...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    getCamera();
  }, []);

  const captureAndSend = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageData = canvasRef.current.toDataURL("image/jpeg");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/predict", {
        image_base64: imageData,
      });
      setStatus(res.data.status.toUpperCase());
    } catch (err) {
      console.error("Error:", err);
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSend();
    }, 1000); // every 1 second
    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Face Liveness Detection</h1>
      <div className="relative">
        <video ref={videoRef} width="640" height="480" autoPlay muted className="rounded-xl shadow-xl" />
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
          <span className={`font-semibold text-lg ${status === "REAL" ? "text-green-400" : status === "FAKE" ? "text-red-400" : "text-yellow-300"}`}>
            {loading ? "Detecting..." : status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
