"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.App = exports.RtcPeer = void 0;
require("./index.css");
var RtcPeer = /** @class */ (function () {
    function RtcPeer() {
    }
    RtcPeer.prototype.handleSendChannelStatusChange = function () {
        var _a;
        console.log("Send channel state is ".concat((_a = this.channel) === null || _a === void 0 ? void 0 : _a.readyState));
    };
    RtcPeer.prototype.createOffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lc, ch, offer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lc = new RTCPeerConnection();
                        ch = lc.createDataChannel('label');
                        ch.onopen = function () { };
                        ch.onclose = function () { };
                        ch.onmessage = function (e) { };
                        ch.onerror = function (e) { };
                        lc.onicecandidate = function (e) {
                            if (e.candidate) {
                                // send the candidate to the remote peer
                            }
                            else {
                                // All ICE candidates have been sent
                            }
                        };
                        return [4 /*yield*/, lc.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, lc.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RtcPeer.prototype.finishOffer = function (offer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.localConnection.setRemoteDescription(offer);
                return [2 /*return*/];
            });
        });
    };
    RtcPeer.prototype.createAnswer = function (offer) {
        return __awaiter(this, void 0, void 0, function () {
            var rc, answer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rc = new RTCPeerConnection();
                        rc.onicecandidate = function (e) {
                            if (e.candidate) {
                                // send the candidate to the remote peer
                            }
                            else {
                                // All ICE candidates have been sent
                            }
                        };
                        rc.onicecandidate = function (e) { return !e.candidate || _this.localConnection.addIceCandidate(e.candidate); };
                        rc.ondatachannel = function (event) {
                            var receiveChannel = event.channel;
                            receiveChannel.onmessage = function (event) {
                                console.log("Received message: ".concat(event.data));
                            };
                        };
                        return [4 /*yield*/, rc.setRemoteDescription(offer)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, rc.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        return [4 /*yield*/, rc.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, rc.localDescription];
                }
            });
        });
    };
    return RtcPeer;
}());
exports.RtcPeer = RtcPeer;
// Define "global" variables
function App() {
    //const ws = new WebSocket("ws://localhost:8080")
    var connect = function () {
        var peerConnection = new RTCPeerConnection(); // eslint-disable-line
        var ch = peerConnection.createDataChannel('dataChannel');
        ch.onopen = function () {
            console.log('data channel open');
        };
        ch.onclose = function () {
            console.log('data channel closed');
        };
        ch.onmessage = function (e) {
            console.log('data channel message', e.data);
        };
        ch.onerror = function (e) {
            console.log('data channel error', e);
        };
        peerConnection.createOffer().then(function (offer) {
            peerConnection.setLocalDescription(offer);
            fetch('http:/localhost:8080/api/whap', {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    Authorization: "Bearer ".concat(location.pathname.substring(1)),
                    'Content-Type': 'application/sdp'
                }
            }).then(function (r) {
                // const parsedLinkHeader = parseLinkHeader(r.headers.get('Link'))
                // setLayerEndpoint(`${window.location.protocol}//${parsedLinkHeader['urn:ietf:params:whep:ext:core:layer'].url}`)
                // const evtSource = new EventSource(`${window.location.protocol}//${parsedLinkHeader['urn:ietf:params:whep:ext:core:server-sent-events'].url}`)
                // evtSource.onerror = err => evtSource.close();
                // evtSource.addEventListener("layers", event => {
                //   const parsed = JSON.parse(event.data)
                //   setVideoLayers(parsed['1']['layers'].map(l => l.encodingId))
                // })
                return r.text();
            }).then(function (answer) {
                peerConnection.setRemoteDescription({
                    sdp: answer,
                    type: 'answer'
                });
            });
        });
    };
}
exports.App = App;
