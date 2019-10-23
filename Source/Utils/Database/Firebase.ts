import firebase_real from "firebase/app";
import {MockFirebaseSdk, MockFirestore} from "firebase-mock";

export let firebaseApp = firebase_real;
export let firebaseAppIsReal = true;

// test
// ==========

/*declare var firebase_app__WEBPACK_IMPORTED_MODULE_1__;
declare var firebase_app__WEBPACK_IMPORTED_MODULE_1___default;*/
if (window.location.href.includes("/personal/---TestingMap---")) {
	console.log("MockFirestoreSDK:", MockFirebaseSdk, "MockFirestore:", MockFirestore);
	//const firestoreMock = new MockFirestore("", "", "", "FirestoreMock");
	const firebaseAppMock = new MockFirebaseSdk();
	console.log("firebaseMock:", firebaseAppMock);

	/*(firebase_app__WEBPACK_IMPORTED_MODULE_1__ as any) = firebaseMock;
	(firebase_app__WEBPACK_IMPORTED_MODULE_1___default as any) = {a: firebaseMock};*/
	firebaseApp = firebaseAppMock;
	firebaseAppIsReal = false;

	// By default, firebaseAppMock.firestore() will return a new/different instance each time it's called!
	// So, we modify it to return the same singleton-value each time.
	//let oldFirestoreFunc = firebaseApp.firestore;
	const firestoreAppSingleton = firebaseApp.firestore();
	(firebaseApp.firestore as any) = ()=>firestoreAppSingleton;
}