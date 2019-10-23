import firebase_real from "firebase/app";
import {MockFirebaseSdk, MockAuthentication, MockFirestore} from "firebase-mock";

export let firebaseApp = firebase_real;
export let firebaseAppIsReal = true;

// firebase mocking (replacing the firebase SDK with a local simplified version, for testing)
// ==========

if (window.location.href.includes("/personal/---TestingMap---")) {
	const realTimeDBMock = null;
	const authMock = new MockAuthentication();
	authMock.autoFlush();
	const firestoreMock = new MockFirestore();
	firestoreMock.autoFlush();
	const storageMock = null;
	const messagingMock = null;

	const firebaseAppMock = new MockFirebaseSdk(()=>realTimeDBMock, ()=>authMock, ()=>firestoreMock, ()=>storageMock, ()=>messagingMock);
	console.log("Set up Firebase app/sdk mock:", firebaseAppMock);

	firebaseApp = firebaseAppMock;
	firebaseAppIsReal = false;
}