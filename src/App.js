import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageCaptured(imageSrc);
  }, [webcamRef]);

  const sendToBackend = async () => {
    if (!imageCaptured) return;
    setLoading(true);
    setResult("");

    // Convert base64 image to a blob
    const blob = await (await fetch(imageCaptured)).blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://face-liveness-backend.onrender.com/predict",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error during detection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Face Liveness Detection
        </h1>

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-lg w-full mb-4"
        />

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={capture}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Capture
          </button>
          <button
            onClick={sendToBackend}
            disabled={loading || !imageCaptured}
            className={`px-4 py-2 rounded ${
              !imageCaptured
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>

        {imageCaptured && (
          <img
            src={imageCaptured}
            alt="Captured"
            className="w-full rounded mb-4"
          />
        )}

        {result && (
          <p className="text-lg text-center font-semibold">
            Result:{" "}
            <span
              className={`${
                result.toLowerCase() === "real"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {result}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
