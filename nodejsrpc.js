
var WebSocket = require('ws');
var  __awaiter = this && this.__awaiter || function (e, t, o, n) {
    return new(o || (o = Promise))(function (s, i) {
        function r(e) {
            try {
                c(n.next(e));
            } catch (e) {
                i(e);
            }
        }
        function a(e) {
            try {
                c(n.throw(e));
            } catch (e) {
                i(e);
            }
        }
        function c(e) {
            e.done ? s(e.value) : new o(function (t) {
                t(e.value);
            }).then(r, a);
        }
        c((n = n.apply(e, t || [])).next());
    });
}, __generator = this && this.__generator || function (e, t) {
    var o,
        n,
        s,
        i,
        r = {
            label: 0,
            sent: function () {
                if (1 & s[0])
                    throw s[1];
                return s[1];
            },
            trys: [],
            ops: []
        };
    return i = {
        next: a(0),
        throw : a(1),
        return : a(2)
    },
    "function" == typeof Symbol && (i[Symbol.iterator] = function () {
        return this;
    }),
        i;
    function a(e) {
        return function (t) {
            return c([e, t]);
        };
    }
    function c(i) {
        if (o)
            throw new TypeError("Generator is already executing.");
        for (; r; )
            try {
                if (o = 1, n && (s = 2 & i[0] ? n.return : i[0] ? n.throw || ((s = n.return) && s.call(n),
                    0) : n.next) && !(s = s.call(n, i[1])).done)
                    return s;
                (n = 0, s) && (i = [2 & i[0], s.value]);
                switch (i[0]) {
                    case 0:
                    case 1:
                        s = i;
                        break;

                    case 4:
                        r.label++;
                        return {
                            value: i[1],
                            done: !1
                        };

                    case 5:
                        r.label++;
                        n = i[1];
                        i = [0];
                        continue;

                    case 7:
                        i = r.ops.pop();
                        r.trys.pop();
                        continue;

                    default:
                        if (!(s = r.trys, s = s.length > 0 && s[s.length - 1]) && (6 === i[0] || 2 === i[0])) {
                            r = 0;
                            continue;
                        }
                        if (3 === i[0] && (!s || i[1] > s[0] && i[1] < s[3])) {
                            r.label = i[1];
                            break;
                        }
                        if (6 === i[0] && r.label < s[1]) {
                            r.label = s[1];
                            s = i;
                            break;
                        }
                        if (s && r.label < s[2]) {
                            r.label = s[2];
                            r.ops.push(i);
                            break;
                        }
                        s[2] && r.ops.pop();
                        r.trys.pop();
                        continue;
                }
                i = t.call(e, r);
            } catch (e) {
                i = [6, e];
                n = 0;
            }
            finally {
                o = s = 0;
            }
        if (5 & i[0])
            throw i[1];
        return {
            value: i[0] ? i[1] : void 0,
            done: !0
        };
    }
};


    function websocket2(opts, handler) {
        this.repeat = 0;
        this.urlIndex = 0;
        this.opts = opts;
        opts.pingTimeout = opts.pingTimeout || 1e4;
        opts.pongTimeout = opts.pingTimeout || 8e3;
        opts.reconnectTimeout = opts.reconnectTimeout || 2e3;
        opts.repeatLimit = opts.repeatLimit || 1e3;
        opts.pingMsg = opts.pingMsg || "p";
        this.pingid = 0;
        this.repeat = 0;
        this.handler = handler;
        this.createWebSocket();
    }
    websocket2.prototype.createWebSocket = function () {
        try {
            var e = null;
            if (this.opts.urls && this.opts.urls.length > 0) {
                console.log("urls:", this.opts.urls);
                this.urlIndex >= this.opts.urls.length && (this.urlIndex = 0);
                e = this.opts.urls[this.urlIndex];
            } else {
                console.log("url:", this.opts.url);
                e = this.opts.url || "";
            }
            console.log("准备开始连接:", e);
            this.ws = new WebSocket(e);
            this.initEventHandle();
        } catch (e) {
            this.reconnect();
            throw e;
        }
    };
    websocket2.prototype.clearWsCallback = function (myws) {
        myws.onclose = function (e) {
            console.log("pre websocket onclose", e);
        };
        myws.onerror = function (e) {
            console.log("pre websocket onerror", e);
        };
        myws.onopen = function (e) {
            console.log("pre websocket onopen", e);
        };
        myws.onmessage = function (e) {
            console.log("pre websocket onmessage", e);
        };
    };
    websocket2.prototype.initEventHandle = function () {
        var t = this;
        this.ws.onclose = function (err) {
            console.log("接受到关闭消息", err.code, err.reason, err.wasClean);
            t.clearWsCallback(t.ws);
            t.handler.onclose(err);
            t.reconnect();
        };
        this.ws.onerror = function (err) {
            console.log("onerror:", JSON.stringify(err));
            console.log("onerror,当前URLIndex:", t.urlIndex);
            t.urlIndex++;
            t.clearWsCallback(t.ws);
            t.handler.onerror(err);
            t.reconnect();
        };
        this.ws.onopen = function (e) {
            t.ws.binaryType = "arraybuffer";
            t.repeat = 0;
            t.handler.onopen(e);
            t.heartCheck();
        };
        this.ws.onmessage = function (o) {
            if (o.data == String.fromCharCode(t.pingid)) {
                var n = Date.now() - t.pingTime;
               // HallNet.event.emit(HallNet.Event.PingMsg, n);
                //xxxxx comment it
                console.log("收到心跳消息包", websocket2.pingid, "diff:", n);
                t.heartCheck();
            } else
                t.handler.onmessage(o);
        };
    };
    websocket2.prototype.reconnect = function () {
        var e = this;
        if (!(this.opts.repeatLimit > 0 && this.opts.repeatLimit <= this.repeat || this.lockReconnect || this.forbidReconnect)) {
            this.lockReconnect = !0;
            this.repeat++;
            this.handler.onreconnect();
            setTimeout(function () {
                e.createWebSocket();
                e.lockReconnect = !1;
            }, this.opts.reconnectTimeout);
        }
    };
    websocket2.prototype.isOpen = function () {
        return !!this.ws && 1 == this.ws.readyState;
    };
    websocket2.prototype.send = function (e) {
        var t = this.ws;
        if (t) {
            if (t.readyState == WebSocket.OPEN) {
                this.ws.send(e);
                return !0;
            }
            console.error("websocket 无法发送，状态:", t.readyState);
        } else
            console.error("websocket 不存在无法发送");
        return !1;
    };
    websocket2.prototype.heartCheck = function () {
        this.heartReset();
        this.heartStart();
    };
    websocket2.prototype.heartStart = function () {
        var e = this;
        this.forbidReconnect || (this.pingTimeoutId = setTimeout(function () {
            e.pingid++;
            e.pingid > 126 && (e.pingid = 1);
            e.pingTime = Date.now();
            e.send(String.fromCharCode(e.pingid)) && (e.pongTimeoutId = setTimeout(function () {
                console.log("pongTimeout,", e.pongTimeoutId);
                var t = e.ws;
                e.clearWsCallback(t);
                t.close();
                var o = {
                    code: 4e3,
                    reason: "ping timeout:" + e.pingid,
                    wasClean: !0
                };
                e.handler.onclose(o);
                e.reconnect();
            }, e.opts.pongTimeout));
            console.log(">> begin heartstart");
        }, this.opts.pingTimeout));
    };
    websocket2.prototype.heartReset = function () {
        //xxxxx comment it
        //console.log(">> heartReset");
        clearTimeout(this.pingTimeoutId);
        this.pingTimeoutId = 0;
        clearTimeout(this.pongTimeoutId);
        this.pongTimeoutId = 0;
    };
    websocket2.prototype.close = function (e, t) {
        console.log("ws close", e, t);
        this.forbidReconnect = !0;
        this.heartReset();
        var o = this.ws;
        if (o) {
            this.clearWsCallback(o);
            o.close();
        }
    };




function WebsocketRPC(t, encodingType) {
    void 0 === encodingType && (encodingType = WebsocketRPC.WSEncoding.Json);
    this._socket = null;
    this.seq = 1;
    this._msgQueue = [];
    this._currentMsg = null;
    this.url = "";
    this.msgid = 0;
    this.queue = {};
    this.isRelease = !1;
    this.handler = t;
    this.encodingType = encodingType;
    encodingType == WebsocketRPC.WSEncoding.Json ? this.encodingMethod = JSON.stringify : encodingType == WebsocketRPC.WSEncoding.MsgPack && (this.encodingMethod = function (e) {
        var t = msgpack.encode(e),
            s = new Uint8Array(t),
            i = new Uint8Array(s.byteLength + 2);
        i[0] = encodingType;
        i[1] = WebsocketRPC.version;
        i.set(s, 2);
        return i.buffer;
    });
    //e.WSEncoding.Json = 0,
    //e.WSEncoding.MsgPack = 1
    if(encodingType == WebsocketRPC.WSEncoding.Json){
        this.encodingMethod = JSON.stringify
    }else if(encodingType == WebsocketRPC.WSEncoding.MsgPack){
        this.encodingMethod = function (msg) {
            var bytes = msgpack.encode(msg),
                s = new Uint8Array(bytes),
                i = new Uint8Array(s.byteLength + 2);
            i[0] = encodingType;
            i[1] = WebsocketRPC.version;
            i.set(s, 2);
            return i.buffer;
        }
    }

    this.initQueue();
}

WebsocketRPC.WSEncoding={};
WebsocketRPC.WSEncoding.Json = 0;
WebsocketRPC.WSEncoding.MsgPack = 1
WebsocketRPC.prototype.initQueue = function () {
    this.queue = {};
};
WebsocketRPC.prototype.close = function () {
    this.clearAllTimeOut();
    this.initQueue();
    this.isRelease = !0;
    if (this._socket) {
        console.log("[ws] onDestroy退出时主动断开连接");
        this._socket.close(0, "close");
        this._socket = null;
    }
};
WebsocketRPC.prototype.clearAllTimeOut = function () {
    Array.prototype.forEach.call(this.queue, function (e) {
        e.timeoutid && clearTimeout(e.timeoutid);
    });
};
WebsocketRPC.prototype.reConnect = function () {
    if (this.isRelease)
        console.error("节点已经释放");
    else {
        this.handler.onWsReConnect();
        !this._socket && this.url && this.connect(this.url);
    }
};

const isFunction = val => val && typeof val === 'function';

WebsocketRPC.prototype.invoke = function (apiName, params, callback, n) {
    var s = this;
    void 0 === n && (n = 8e3);
    if (isFunction(callback)) {
        var msgid = ++this.msgid,
            r = this.encodingMethod([4, msgid, apiName, params]),
            a = {
                timeoutid: setTimeout(function () {
                    delete s.queue[msgid];
                    callback({
                        errcode: 0,
                        desc: "远程调用超时"
                    });
                }, n),
                callback: callback
            };
        this.queue[msgid] = a;
        var c = String(msgid);
        console.time(c);
        console.log("crack xxxxx invoke 1: ",r)
        this._socket.send(r);
        console.timeEnd(c);
    } else {
        r = this.encodingMethod([0, 0, apiName, params]);
        console.log("crack xxxxx invoke 2: ",r)
        this._socket.send(r);
    }
};
WebsocketRPC.prototype.asyncInvoke = function (e, t, o) {
    void 0 === o && (o = 8e3);
    return __awaiter(this, void 0, void 0, function () {
        var n = this;
        return __generator(this, function (s) {
            return [2, new Promise(function (s, i) {
                if (!n._socket)
                    return i("not found socket");
                if (!n._socket.isOpen())
                    return i("socket status not is open");
                n.invoke(e, t, function (e) {
                    s(e);
                }, o);
            })];
        });
    });
};
WebsocketRPC.prototype.asyncEmit = function (e, apiName, params) {
    return __awaiter(this, void 0, void 0, function () {
        var e = this;
        return __generator(this, function (n) {
            return [2, new Promise(function (n, s) {
                if (!e._socket)
                    return s("not found socket");
                if (!e._socket.isOpen())
                    return s("socket status not is open");
                e.invoke(apiName, params, function (e) {
                    n(e);
                });
            })];
        });
    });
};
WebsocketRPC.prototype.isOpen = function () {
    return !!this._socket && this._socket.isOpen();
};
WebsocketRPC.prototype.asyncCallRoom = function (apiName, params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (o) {
            switch (o.label) {
                case 0:
                    return [4, this.asyncEmit("room", apiName, params)];

                case 1:
                    return [2, o.sent()];
            }
        });
    });
};
WebsocketRPC.prototype.asyncCallRoomWithTimeOut = function (e, t, o) {
    void 0 === o && (o = 1);
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (o) {
            switch (o.label) {
                case 0:
                    return [4, this.asyncCallRoom(e, t)];

                case 1:
                    return [2, o.sent()];
            }
        });
    });
};
WebsocketRPC.prototype.onclose = function (e) {
    console.log("WebSocket instance closed.");
    this.isRelease ? console.error("onClose 节点已经释放") : this.handler.onWsClose(e);
};
WebsocketRPC.prototype.onerror = function (e) {
    console.log("wsclient onerror", e);
    this.isRelease ? console.error("onerror 节点已经释放") : this.handler.onWsError(e);
};
WebsocketRPC.prototype.onopen = function (e) {
    console.log("[ws] socket连接成功");
    if (this.isRelease)
        console.error("onopen 节点已经释放");
    else {
        this.clearAllTimeOut();
        this.initQueue();
        this._msgQueue = [];
        this.handler.onWsOpen(e);
    }
};
WebsocketRPC.prototype.onmessage = function (e) {
    if (this.isRelease)
        console.error("onmessage 节点已经释放");
    else {
        var o,
            n = e.data;
        if ("string" == typeof n)
            "[" === n[0] && (o = JSON.parse(n));
        else if (n instanceof ArrayBuffer) {
            var s = new Uint8Array(n),
                i = s[0];
            s[1];
            if (i == t.MsgPack) {
                var r = s.slice(2);
                o = msgpack.decode(r);
            } else
                console.error("未知编码格式", i);
        }
        //console.log("onmessage:", o);
        if (Array.isArray(o))
            if (o.every(function (e) {
                return Array.isArray(e);
            }))
                for (var a = 0, c = o; a < c.length; a++) {
                    var l = c[a];
                    console.log("onmessage xxxxx 合并消息>>>>", l);
                    this.doneMsg(l);
                }
            else {
                console.log("onmessage xxxxx 单消息>>>>", JSON.stringify(o));
                this.doneMsg(o);
            }
        else
            console.log("非法array数据");
    }
};
WebsocketRPC.prototype.onreconnect = function () {
    console.log("Method not implemented.");
};
WebsocketRPC.prototype.connect = function (e, t) {
    if (this._socket)
        console.log("[WsRpc]", "socket之前已经连接上了");
    else {
        console.log("[WsRpc xxxxx] 开始连接游戏服务器", e);
        var n = new websocket2({
            url: e,
            urls: t
        }, this);
        this._socket = n;
    }
};
WebsocketRPC.prototype.tryPullWsMsg = function () {
    return __awaiter(this, void 0, void 0, function () {
        var e,
            t;
        return __generator(this, function (o) {
            switch (o.label) {
                case 0:
                    if (this._currentMsg)
                        return [2];
                    e = this._msgQueue;
                    t = null;
                    o.label = 1;

                case 1:
                    t = e.shift();
                    this._currentMsg = t;
                    if (!Array.isArray(t) || 2 != t.length)
                        return [3, 6];
                    o.label = 2;

                case 2:
                    o.trys.push([2, 4, , 5]);
                    return [4, this.doneWebsocketMsg(t[0], t[1])];

                case 3:
                    o.sent();
                    return [3, 5];

                case 4:
                    o.sent();
                    console.error("执行代码异常，消息为:", t);
                    return [3, 5];

                case 5:
                    return [3, 7];

                case 6:
                    if (t) {
                        this._currentMsg = null;
                        console.error("错误格式的消息", t);
                        return [3, 8];
                    }
                    this._currentMsg = null;
                    return [3, 8];

                case 7:
                    return [3, 1];

                case 8:
                    return [2];
            }
        });
    });
};
WebsocketRPC.prototype.doneMsg = function (e) {
    return __awaiter(this, void 0, void 0, function () {
        var t,
            o,
            n,
            s,
            i,
            r,
            a,
            c;
        return __generator(this, function (l) {
            switch (l.label) {
                case 0:
                    if (!Array.isArray(e) || e.length < 3) {
                        console.log("非法array数据");
                        return [2];
                    }
                    if (1 !== (t = e[0]))
                        return [3, 1];
                    o = e[1],
                        n = e[2],
                        s = e[3],
                        c = e[4];
                    if (!this.queue) {
                        console.warn("队列已经失效");
                        return [2];
                    }
                    if (i = this.queue[o]) {
                        delete this.queue[o];
                        clearTimeout(i.timeoutid);
                        i.timeoutid = 0;
                        i.callback({
                            errcode: n,
                            desc: s,
                            data: c
                        });
                    }
                    return [3, 5];

                case 1:
                    if (2 !== t)
                        return [3, 5];
                    r = e[1],
                        a = e[2],
                        c = e[3];

                    //console.log("doneMsg", JSON.stringify(e));
                    if (!this._msgQueue) {
                        console.warn("消息队列已经失效");
                        return [2];
                    }
                    if (!r)
                        return [3, 3];
                    this._msgQueue.push([a, c]);
                    return [4, this.tryPullWsMsg()];

                case 2:
                    l.sent();
                    return [3, 5];

                case 3:
                    return [4, this.doneWebsocketMsg(a, c)];

                case 4:
                    l.sent();
                    l.label = 5;

                case 5:
                    return [2];
            }
        });
    });
};
WebsocketRPC.prototype.doneWebsocketMsg = function (e, t) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (o) {
            switch (o.label) {
                case 0:
                    return [4, this.handler.onWsCall(e, t)];

                case 1:
                    return [2, o.sent()];
            }
        });
    });
};
WebsocketRPC.version = 1;


var HallNet = function(){

}

HallNet.prototype.startGame = function () {

        this.ws = new WebsocketRPC(this, WebsocketRPC.WSEncoding.Json);

        var r = "ws://127.0.0.1:9000/ws/uni?uid=xxxxxx&serverid=xxxxxx&token=8584ec7167a637ff2a1d7154af4310c70123beec946764876a442dca2623fc204cd0599d2e310ac40b4625777e182334fb764e64d3e7660f5fd9bbf3b49bb11c"
        this.ws.connect(r);
};

HallNet.prototype.closeGame = function () {
    //return await this.ws && this.ws.close();
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (t) {
            this.ws && this.ws.close();
            return [2];
        });
    });
};
HallNet.prototype.asyncCallRoom = function (apiName, params) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (n) {
            switch (n.label) {
                case 0:
                    return [4, this.ws.asyncCallRoom(apiName, params)];

                case 1:
                    return [2, n.sent()];
            }
        });
    });
};
HallNet.prototype.asyncCallRoomWithTimeOut = function (t, e, n) {
    void 0 === n && (n = 1);
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (i) {
            switch (i.label) {
                case 0:
                    return [4, this.ws.asyncCallRoomWithTimeOut(t, e, n)];

                case 1:
                    return [2, i.sent()];
            }
        });
    });
};
HallNet.prototype.onUnknowAction = function (t, e) {};
HallNet.prototype.onWsOpen = function (t) {

};
HallNet.prototype.onWsReConnect = function () {
   console.log("网络断开，正在自动重连恢复数据");
};
HallNet.prototype.onWsClose = function (t) {
    console.log("网络断开，正在自动重连恢复数据");
};
HallNet.prototype.onWsError = function (t) {
    console.log("网络错误，请切换到信号好的网络环境中");
};
HallNet.prototype.onWsCall = function (t, e) {
    return __awaiter(this, void 0, void 0, function () {
        var n,
            i,
            o;
        return __generator(this, function (r) {
            switch (r.label) {
                case 0:
                    if ("system" == t) {
                        if ("backHall" === e.action) {
                             console.log("\n点击确定重新启动游戏!\n");
                            return [2];
                        }
                        if ("exitGame" === e.action) {

                            console.log("\n点击确定退出游戏!\n");
                            return [2];
                        }
                    }
                    if (!(i = (n = this)[t + "Action"])) {
                        console.error("未实现方法", t);
                        return [2];
                    }
                    if (!l.isFunction(i))
                        throw new Error("非方法:" + t);
                    r.label = 1;

                case 1:
                    r.trys.push([1, 3, , 4]);


                    var handleCircular = function () {
                        var cache = [];
                        var keyCache = []
                        return function (key, value) {
                            if (typeof value === 'object' && value !== null) {
                                var index = cache.indexOf(value);
                                if (index !== -1) {
                                    return '[Circular ' + keyCache[index] + ']';
                                }
                                cache.push(value);
                                keyCache.push(key || 'root');
                            }
                            return value;
                        }
                    }

                    var tmp = JSON.stringify;
                    JSON.stringify = function (value, replacer, space) {
                        replacer = replacer || handleCircular();
                        return tmp(value, replacer, space);
                    }
                    console.log("crack e",JSON.stringify(e))
                    return [4, i.call(n, "0", e)];

                case 2:
                    r.sent();
                    return [3, 4];

                case 3:
                    o = r.sent();
                    console.error(o);
                    return [3, 4];

                case 4:
                    return [2];
            }
        });
    });
};

var hallnet = new HallNet();
hallnet.startGame()

//hallnet.asyncCallRoom("chupai", {cards:[]})
process.stdin.resume();
process.stdin.on('end', function() {
    process.stdout.write('end');
});

function gets(cb){
    process.stdin.setEncoding('utf8');
    //输入进入流模式（flowing-mode，默认关闭，需用resume开启），注意开启后将无法read到数据
    //见 https://github.com/nodejs/node-v0.x-archive/issues/5813
    process.stdin.resume();
    process.stdin.on('data', function(chunk) {
        console.log('start!');
        //去掉下一行可一直监听输入，即保持标准输入流为开启模式
        //process.stdin.pause();
        cb(chunk);
    });
    console.log('试着在键盘敲几个字然后按回车吧');
}

gets(function(result){
    console.log("输入：["+result+"]\n");
    //eval(result)
    try  {
        eval(result)
    }
    catch(exception) {
        console.log(exception);
    }
    //process.stdin.emit('end'); //触发end事件
});
