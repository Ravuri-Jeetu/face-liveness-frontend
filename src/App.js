import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

export default function LiveDetection() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          fetch("https://face-liveness-backend.onrender.com/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageSrc }),
          })
            .then((res) => res.json())
            .then((data) => {
              setResult(data.prediction);
            })
            .catch((err) => {
              console.error("Error:", err);
            });
        }
      }
    }, 1000); // send frame every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg"
        videoConstraints={{ facingMode: "user" }}
      />
      <div className="mt-4 text-xl font-semibold">{result}</div>
    </div>
  );
}
