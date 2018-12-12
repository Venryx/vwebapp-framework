"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var redux_persist_1 = require("redux-persist");
var index_1 = require("../../Store/index");
var ActionProcessor_1 = require("./ActionProcessor");
//import {version, firebaseConfig} from "../../BakedConfig";
//var {version, firebaseConfig} = require(prodEnv ? "../../BakedConfig_Prod" : "../../BakedConfig_Dev");
//import {batchedUpdatesMiddleware} from "redux-batched-updates";
var redux_batched_subscribe_1 = require("redux-batched-subscribe");
var react_dom_1 = require("react-dom");
var redux_little_router_1 = require("redux-little-router");
var firebase_1 = require("firebase");
var react_redux_firebase_1 = require("react-redux-firebase");
var redux_firestore_1 = require("redux-firestore");
require("firebase/firestore");
var Main_1 = require("Main");
var firebase = firebase_1.default;
var routes = {
    "/": {},
    "/:seg": {},
    "/:seg/:seg": {},
    "/:seg/:seg/:seg": {},
    "/:seg/:seg/:seg/:seg": {},
    "/:seg/:seg/:seg/:seg/:seg": {},
};
var _a = redux_little_router_1.routerForBrowser({
    routes: routes,
}), routerReducer = _a.reducer, routerMiddleware = _a.middleware, routerEnhancer = _a.enhancer;
//export const browserHistory = createBrowserHistory();
//import {browserHistory} from "react-router";
function default_1(initialState, history) {
    if (initialState === void 0) { initialState = {}; }
    // Window Vars Config
    // ==========
    g.version = Main_1.version;
    // Middleware Configuration
    // ==========
    var middleware = [
        //thunk.withExtraArgument(getFirebase),
        // for some reason, this breaks stuff if we have it the last one
        /*store=>next=>action=> {
            Log("What!" + action.type);
            PreDispatchAction(action);
            const returnValue = next(action);
            MidDispatchAction(action, returnValue);
            WaitXThenRun(0, ()=>PostDispatchAction(action));
            return returnValue;
        },*/
        //routerMiddleware(browserHistory),
        routerMiddleware,
    ];
    var lateMiddleware = [
        // for some reason, this breaks stuff if we have it the last one
        function (store) { return function (next) { return function (action) {
            ActionProcessor_1.PreDispatchAction(action);
            if (action.type == "ApplyActionSet")
                for (var _i = 0, _a = action.actions; _i < _a.length; _i++) {
                    var sub = _a[_i];
                    ActionProcessor_1.PreDispatchAction(sub);
                }
            var returnValue = next(action);
            ActionProcessor_1.MidDispatchAction(action, returnValue);
            if (action.type == "ApplyActionSet")
                for (var _b = 0, _c = action.actions; _b < _c.length; _b++) {
                    var sub = _c[_b];
                    ActionProcessor_1.MidDispatchAction(sub, returnValue);
                }
            setTimeout(function () {
                ActionProcessor_1.PostDispatchAction(action);
                if (action.type == "ApplyActionSet")
                    for (var _i = 0, _a = action.actions; _i < _a.length; _i++) {
                        var sub = _a[_i];
                        ActionProcessor_1.PostDispatchAction(sub);
                    }
            });
            return returnValue;
        }; }; },
    ];
    // redux dev-tools config
    // ==========
    var reduxDevToolsConfig = {
        maxAge: 70,
    };
    // Store Instantiation and HMR Setup
    // ==========
    //reduxConfig["userProfile"] = DBPath("users"); // root that user profiles are written to
    var reduxFirebaseConfig = {
        //userProfile: DBPath("users"), // root that user profiles are written to
        userProfile: "versions/v" + Main_1.dbVersion + "-" + Main_1.env_short + "/users",
        enableLogging: true,
        updateProfileOnLogin: false,
        // profileDecorator: (userData) => ({ email: userData.email }) // customize format of user profile
        useFirestoreForProfile: true,
    };
    if (firebase.apps.length == 0) {
        firebase.initializeApp(Main_1.firebaseConfig);
    }
    var firestoreDB = firebase.firestore();
    firestoreDB.settings({ timestampsInSnapshots: true });
    var extraReducers = {
        router: routerReducer,
    };
    var rootReducer = index_1.MakeRootReducer(extraReducers);
    var store = redux_1.createStore(rootReducer, initialState, 
    // Note: Compose applies functions from right to left: compose(f, g, h) = (...args)=>f(g(h(...args))).
    // You can think of the earlier ones as "wrapping" and being able to "monitor" the ones after it, but (usually) telling them "you apply first, then I will".
    redux_1.compose.apply(void 0, [
        //autoRehydrate({log: true}),
        routerEnhancer,
        redux_1.applyMiddleware.apply(void 0, middleware),
        react_redux_firebase_1.reactReduxFirebase(firebase, reduxFirebaseConfig),
        redux_firestore_1.reduxFirestore(firebase, {}),
        redux_batched_subscribe_1.batchedSubscribe(react_dom_1.unstable_batchedUpdates),
        redux_1.applyMiddleware.apply(void 0, lateMiddleware),
        g.devToolsExtension && g.devToolsExtension(reduxDevToolsConfig),
    ].filter(function (a) { return a; })));
    store.reducer = rootReducer;
    function Dispatch_WithStack(action) {
        if (g.actionStacks || (Main_1.devEnv && !actionStacks_actionTypeIgnorePatterns.Any(function (a) { return action.type.startsWith(a); }))) {
            action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
        }
        return store["dispatch_orig"](action);
    }
    if (store.dispatch != Dispatch_WithStack) {
        store["dispatch_orig"] = store.dispatch;
        store.dispatch = Dispatch_WithStack;
    }
    var actionStacks_actionTypeIgnorePatterns = [
        "@@reactReduxFirebase/",
    ];
    /*let w = watch(()=>State());
    store.subscribe(w((newVal, oldVal) => {
        ProcessAction(g.lastAction, newVal, oldVal);
    }));*/
    // begin periodically persisting the store
    //let persister = persistStore(store, {whitelist: ["main"]});
    // you want to remove some keys before you save
    //let persister = persistStore(store, null, ()=>g.storeRehydrated = true);
    var persister = redux_persist_1.persistStore(store);
    if (startURL.GetQueryVar("clearState")) {
        Log("Clearing redux-store's state and local-storage...");
        ClearLocalData(persister);
    }
    if (__DEV__) {
        if (module.hot) {
            module.hot.accept("../../Store", function () {
                var MakeRootReducer = require("../../Store").MakeRootReducer;
                store.reducer = MakeRootReducer(extraReducers);
                store.replaceReducer(store.reducer);
            });
        }
    }
    return { store: store, persister: persister };
}
exports.default = default_1;
function ClearLocalData(persister) {
    persister.purge();
    //localStorage.clear();
    for (var key in localStorage) {
        if (key.startsWith("firebase:"))
            continue; // keep auth-info
        delete localStorage[key];
    }
}
exports.ClearLocalData = ClearLocalData;
//# sourceMappingURL=CreateStore.js.map