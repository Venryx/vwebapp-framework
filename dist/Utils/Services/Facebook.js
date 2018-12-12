"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function GetFBAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve_, reject) {
                    FB.getLoginStatus(function (response) {
                        if (response.status === "connected") {
                            resolve(response.authResponse.accessToken);
                        }
                        else if (response.status === "not_authorized") {
                            FB.login(function (response) {
                                resolve(response.authResponse.accessToken);
                            }, { scope: "publish_actions" });
                        }
                        else {
                            FB.login(function (response) {
                                resolve(response.authResponse.accessToken);
                            }, { scope: "publish_actions" });
                        }
                    });
                    function resolve(token) {
                        console.log("Token:" + token);
                        resolve_(token);
                    }
                })];
        });
    });
}
exports.GetFBAccessToken = GetFBAccessToken;
function PostImageToFacebook(token, filename, mimeType, imageDataBlob, message) {
    return __awaiter(this, void 0, void 0, function () {
        var fd, uploadPhotoResponse, makePostResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fd = new FormData();
                    fd.append("access_token", token);
                    fd.append("source", imageDataBlob);
                    //fd.append("message", "photo message for " + filename);
                    fd.append("no_story", "true");
                    //fd.append("privacy", "SELF");
                    fd.append("published", "false");
                    return [4 /*yield*/, $.ajax({
                            url: "https://graph.facebook.com/me/photos?access_token=" + token,
                            type: "POST",
                            data: fd,
                            processData: false,
                            contentType: false,
                            cache: false
                        })];
                case 1:
                    uploadPhotoResponse = _a.sent();
                    console.log("Uploaded photo \"" + filename + "\": ", uploadPhotoResponse);
                    return [4 /*yield*/, $.ajax({
                            "async": true,
                            "crossDomain": true,
                            "url": "https://graph.facebook.com/v2.11/me/feed",
                            "method": "POST",
                            "headers": {
                                "cache-control": "no-cache",
                                "content-type": "application/x-www-form-urlencoded"
                            },
                            "data": {
                                "message": message,
                                "attached_media[0]": "{\"media_fbid\":" + uploadPhotoResponse.id + "}",
                                //"attached_media[1]": `{"media_fbid":${uploadPhotoResponse2.id}}`,
                                "access_token": token
                            }
                        })];
                case 2:
                    makePostResponse = _a.sent();
                    console.log("Made post: ", makePostResponse);
                    return [2 /*return*/];
            }
        });
    });
}
exports.PostImageToFacebook = PostImageToFacebook;
//# sourceMappingURL=Facebook.js.map