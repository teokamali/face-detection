
import { useEffect, useRef } from 'react';
import './App.css';
import Webcam from 'react-webcam';
import * as faceApi from 'face-api.js';

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadModelsAndStartDetection = async () => {
      await faceApi.nets.ssdMobilenetv1.load('/assets/ssd_mobilenetv1/ssd_mobilenetv1_model-weights_manifest.json');
      await faceApi.nets.faceLandmark68Net.load('/assets/face_landmark_68/face_landmark_68_model-weights_manifest.json');
      await faceApi.nets.faceRecognitionNet.load('/assets/face_recognition/face_recognition_model-weights_manifest.json');
      await faceApi.nets.ageGenderNet.load('/assets/age_gender_model/age_gender_model-weights_manifest.json');

      // Start the face detection loop
      requestAnimationFrame(detectFaces);
    };

    const detectFaces = async () => {

      if (webcamRef.current && canvasRef.current) {
        const videoElement = webcamRef.current.video as HTMLVideoElement;
        const canvasElement = canvasRef.current;
        const context = canvasElement.getContext('2d');

        const options = new faceApi.SsdMobilenetv1Options({ maxResults: 120 });
        const result = await faceApi.detectAllFaces(videoElement, options)
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withAgeAndGender()

        if (context) {
          context.clearRect(0, 0, canvasElement.width, canvasElement.height);
          if (result.length > 0) {
            result.forEach(async (detection) => {
              // Get the position of the detected face
              const face = detection.detection.box;
              const { width, height } = face
              const { age, gender } = detection
              // Adjust the position of the canvas based on the detected face
              const canvasB = face.bottom; // Adjust as needed
              const canvasL = face.left; // Adjust as needed

              // Set the canvas properties
              canvasElement.width = width;
              canvasElement.height = height;
              canvasElement.style.border = '3px solid red';
              canvasElement.style.position = 'absolute';
              canvasElement.style.left = `${canvasL}px`;
              canvasElement.style.bottom = `${canvasB}px`;

              // You can also draw on the canvas here if needed
              // For example, you can draw rectangles, text, etc.

              context.fillStyle = '#fff'; // Set the text color
              context.font = '20px Arial bold'; // Set the font size and family
              context.fillText(`Age: ${age.toFixed(0)}`, 10, 20); // Draw the age text below the rectangles
              context.fillText(`Gender: ${gender}`, 10, 50); // Draw the gender text below the rectangles


            });
          } else {
            // If no face is detected, clear the canvas
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);
          }
        }

        // Continue the face detection loop
        requestAnimationFrame(detectFaces);
      }
    };


    loadModelsAndStartDetection();
  }, [webcamRef.current, canvasRef.current]);

  return (
    <div style={{ position: 'relative' }}>
      <Webcam
        capture='user'
        ref={webcamRef}
        width={'600px'}
        height={'600px'}
      />
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
