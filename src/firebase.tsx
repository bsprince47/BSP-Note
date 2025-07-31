import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyC1HlXj7EkC7ojpJVNcBFbvNlJLZvbLvHc",
  authDomain: "bsp-notes.firebaseapp.com",
  projectId: "bsp-notes",
  storageBucket: "bsp-notes.firebasestorage.app",
  messagingSenderId: "835580107487",
  appId: "1:835580107487:web:aaf3a625addafc1b1b276a",
  measurementId: "G-62J6HHVTHZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const Fdb = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// Initialize the Gemini Developer API backend service
// const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// const quizSchema = Schema.object({
//   properties: {
//     quiz: Schema.array({
//       items: Schema.object({
//         properties: {
//           id: Schema.number(),
//           question: Schema.string(),
//           options: Schema.array({
//             items: Schema.string(),
//           }),
//           correct: Schema.number(),
//         },
//       }),
//     }),
//   },
// });

// // Create a `GenerativeModel` instance with a model that supports your use case
// const model = getGenerativeModel(ai, {
//   model: "gemini-2.5-flash",
//   // In the generation config, set the `responseMimeType` to `application/json`
//   // and pass the JSON schema object into `responseSchema`.
//   generationConfig: {
//     responseMimeType: "application/json",
//     responseSchema: quizSchema,
//   },
// });

// let result = await model.generateContent(
//   "generaate quiz about pakistan pageContent"
// );
// console.log(result.response.text());
