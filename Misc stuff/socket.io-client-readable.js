(function () {
	function require(p, parent, orig) {
		var path = require.resolve(p),
		mod = require.modules[path];
		if (null == path) {
			orig = orig || p;
			parent = parent || "root";
			throw new Error('failed to require "' + orig + '" from "' + parent + '"')
		}
		if (!mod.exports) {
			mod.exports = {};
			mod.client = mod.component = true;
			mod.call(this, mod, mod.exports, require.relative(path))
		}
		return mod.exports
	}
	require.modules = {};
	require.aliases = {};
	require.resolve = function (path) {
		var orig = path,
		reg = path + ".js",
		regJSON = path + ".json",
		index = path + "/index.js",
		indexJSON = path + "/index.json";
		return require.modules[reg] && reg || require.modules[regJSON] && regJSON || require.modules[index] && index || require.modules[indexJSON] && indexJSON || require.modules[orig] && orig || require.aliases[index]
	};
	require.normalize = function (curr, path) {
		var segs = [];
		if ("." != path.charAt(0))
			return path;
		curr = curr.split("/");
		path = path.split("/");
		for (var i = 0; i < path.length; ++i) {
			if (".." == path[i]) {
				curr.pop()
			} else if ("." != path[i] && "" != path[i]) {
				segs.push(path[i])
			}
		}
		return curr.concat(segs).join("/")
	};
	require.register = function (path, fn) {
		require.modules[path] = fn
	};
	require.alias = function (from, to) {
		var fn = require.modules[from];
		if (!fn)
			throw new Error('failed to alias "' + from + '", it does not exist');
		require.aliases[to] = from
	};
	require.relative = function (parent) {
		var p = require.normalize(parent, "..");
		function lastIndexOf(arr, obj) {
			var i = arr.length;
			while (i--) {
				if (arr[i] === obj)
					return i
			}
			return -1
		}
		function fn(path) {
			var orig = path;
			path = fn.resolve(path);
			return require(path, parent, orig)
		}
		fn.resolve = function (path) {
			if ("." != path.charAt(0)) {
				var segs = parent.split("/");
				var i = lastIndexOf(segs, "deps") + 1;
				if (!i)
					i = 0;
				path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
				return path
			}
			return require.normalize(p, path)
		};
		fn.exists = function (path) {
			return !!require.modules[fn.resolve(path)]
		};
		return fn
	};
	require.register("learnboost-engine.io-client/lib/index.js", function (module, exports, require) {
		module.exports = require("./socket")
	});
	require.register("learnboost-engine.io-client/lib/parser.js", function (module, exports, require) {
		var util = require("./util");
		var packets = exports.packets = {
			open : 0,
			close : 1,
			ping : 2,
			pong : 3,
			message : 4,
			upgrade : 5,
			noop : 6
		};
		var packetslist = util.keys(packets);
		var err = {
			type : "error",
			data : "parser error"
		};
		exports.encodePacket = function (packet) {
			var encoded = packets[packet.type];
			if (undefined !== packet.data) {
				encoded += String(packet.data)
			}
			return "" + encoded
		};
		exports.decodePacket = function (data) {
			var type = data.charAt(0);
			if (Number(type) != type || !packetslist[type]) {
				return err
			}
			if (data.length > 1) {
				return {
					type : packetslist[type],
					data : data.substring(1)
				}
			} else {
				return {
					type : packetslist[type]
				}
			}
		};
		exports.encodePayload = function (packets) {
			if (!packets.length) {
				return "0:"
			}
			var encoded = "",
			message;
			for (var i = 0, l = packets.length; i < l; i++) {
				message = exports.encodePacket(packets[i]);
				encoded += message.length + ":" + message
			}
			return encoded
		};
		exports.decodePayload = function (data) {
			if (data == "") {
				return [err]
			}
			var packets = [],
			length = "",
			n,
			msg,
			packet;
			for (var i = 0, l = data.length; i < l; i++) {
				var chr = data.charAt(i);
				if (":" != chr) {
					length += chr
				} else {
					if ("" == length || length != (n = Number(length))) {
						return [err]
					}
					msg = data.substr(i + 1, n);
					if (length != msg.length) {
						return [err]
					}
					if (msg.length) {
						packet = exports.decodePacket(msg);
						if (err.type == packet.type && err.data == packet.data) {
							return [err]
						}
						packets.push(packet)
					}
					i += n;
					length = ""
				}
			}
			if (length != "") {
				return [err]
			}
			return packets
		}
	});
	require.register("learnboost-engine.io-client/lib/socket.js", function (module, exports, require) {
		var util = require("./util"),
		transports = require("./transports"),
		Emitter = require("./emitter"),
		debug = require("debug")("engine-client:socket");
		module.exports = Socket;
		var global = "undefined" != typeof window ? window : global;
		function Socket(opts) {
			if (!(this instanceof Socket))
				return new Socket(opts);
			if ("string" == typeof opts) {
				var uri = util.parseUri(opts);
				opts = arguments[1] || {};
				opts.host = uri.host;
				opts.secure = uri.protocol == "https" || uri.protocol == "wss";
				opts.port = uri.port
			}
			opts = opts || {};
			this.secure = null != opts.secure ? opts.secure : global.location && "https:" == location.protocol;
			this.host = opts.host || opts.hostname || (global.location ? location.hostname : "localhost");
			this.port = opts.port || (global.location && location.port ? location.port : this.secure ? 443 : 80);
			this.query = opts.query || {};
			this.query.uid = rnd();
			this.upgrade = false !== opts.upgrade;
			this.resource = opts.resource || "default";
			this.path = (opts.path || "/engine.io").replace(/\/$/, "");
			this.path += "/" + this.resource + "/";
			this.forceJSONP = !!opts.forceJSONP;
			this.timestampParam = opts.timestampParam || "t";
			this.timestampRequests = !!opts.timestampRequests;
			this.flashPath = opts.flashPath || "";
			this.transports = opts.transports || ["polling", "websocket", "flashsocket"];
			this.readyState = "";
			this.writeBuffer = [];
			this.policyPort = opts.policyPort || 843;
			this.open();
			Socket.sockets.push(this);
			Socket.sockets.evs.emit("add", this)
		}
		Emitter(Socket.prototype);
		Socket.protocol = 1;
		Socket.sockets = [];
		Socket.sockets.evs = new Emitter;
		Socket.Socket = Socket;
		Socket.Transport = require("./transport");
		Socket.Emitter = require("./emitter");
		Socket.transports = require("./transports");
		Socket.util = require("./util");
		Socket.parser = require("./parser");
		Socket.prototype.createTransport = function (name) {
			debug('creating transport "%s"', name);
			var query = clone(this.query);
			query.transport = name;
			if (this.id) {
				query.sid = this.id
			}
			var transport = new transports[name]({
					host : this.host,
					port : this.port,
					secure : this.secure,
					path : this.path,
					query : query,
					forceJSONP : this.forceJSONP,
					timestampRequests : this.timestampRequests,
					timestampParam : this.timestampParam,
					flashPath : this.flashPath,
					policyPort : this.policyPort
				});
			return transport
		};
		function clone(obj) {
			var o = {};
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					o[i] = obj[i]
				}
			}
			return o
		}
		Socket.prototype.open = function () {
			this.readyState = "opening";
			var transport = this.createTransport(this.transports[0]);
			transport.open();
			this.setTransport(transport)
		};
		Socket.prototype.setTransport = function (transport) {
			var self = this;
			if (this.transport) {
				debug("clearing existing transport");
				this.transport.removeAllListeners()
			}
			this.transport = transport;
			transport.on("drain", function () {
				self.flush()
			}).on("packet", function (packet) {
				self.onPacket(packet)
			}).on("error", function (e) {
				self.onError(e)
			}).on("close", function () {
				self.onClose("transport close")
			})
		};
		Socket.prototype.probe = function (name) {
			debug('probing transport "%s"', name);
			var transport = this.createTransport(name, {
					probe : 1
				}),
			failed = false,
			self = this;
			transport.once("open", function () {
				if (failed)
					return;
				debug('probe transport "%s" opened', name);
				transport.send([{
							type : "ping",
							data : "probe"
						}
					]);
				transport.once("packet", function (msg) {
					if (failed)
						return;
					if ("pong" == msg.type && "probe" == msg.data) {
						debug('probe transport "%s" pong', name);
						self.upgrading = true;
						self.emit("upgrading", transport);
						debug('pausing current transport "%s"', self.transport.name);
						self.transport.pause(function () {
							if (failed)
								return;
							if ("closed" == self.readyState || "closing" == self.readyState) {
								return
							}
							debug("changing transport and sending upgrade packet");
							transport.removeListener("error", onerror);
							self.emit("upgrade", transport);
							self.setTransport(transport);
							transport.send([{
										type : "upgrade"
									}
								]);
							transport = null;
							self.upgrading = false;
							self.flush()
						})
					} else {
						debug('probe transport "%s" failed', name);
						var err = new Error("probe error");
						err.transport = transport.name;
						self.emit("error", err)
					}
				})
			});
			transport.once("error", onerror);
			function onerror(err) {
				if (failed)
					return;
				failed = true;
				var error = new Error("probe error: " + err);
				error.transport = transport.name;
				transport.close();
				transport = null;
				debug('probe transport "%s" failed because of error: %s', name, err);
				self.emit("error", error)
			}
			transport.open();
			this.once("close", function () {
				if (transport) {
					debug("socket closed prematurely - aborting probe");
					failed = true;
					transport.close();
					transport = null
				}
			});
			this.once("upgrading", function (to) {
				if (transport && to.name != transport.name) {
					debug('"%s" works - aborting "%s"', to.name, transport.name);
					transport.close();
					transport = null
				}
			})
		};
		Socket.prototype.onOpen = function () {
			debug("socket open");
			this.readyState = "open";
			this.emit("open");
			this.onopen && this.onopen.call(this);
			this.flush();
			if ("open" == this.readyState && this.upgrade && this.transport.pause) {
				debug("starting upgrade probes");
				for (var i = 0, l = this.upgrades.length; i < l; i++) {
					this.probe(this.upgrades[i])
				}
			}
		};
		Socket.prototype.onPacket = function (packet) {
			if ("opening" == this.readyState || "open" == this.readyState) {
				debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
				this.emit("packet", packet);
				this.emit("heartbeat");
				switch (packet.type) {
				case "open":
					this.onHandshake(util.parseJSON(packet.data));
					break;
				case "pong":
					this.ping();
					break;
				case "error":
					var err = new Error("server error");
					err.code = packet.data;
					this.emit("error", err);
					break;
				case "message":
					this.emit("message", packet.data);
					var event = {
						data : packet.data
					};
					event.toString = function () {
						return packet.data
					};
					this.onmessage && this.onmessage.call(this, event);
					break
				}
			} else {
				debug('packet received with socket readyState "%s"', this.readyState)
			}
		};
		Socket.prototype.onHandshake = function (data) {
			this.emit("handshake", data);
			this.id = data.sid;
			this.transport.query.sid = data.sid;
			this.upgrades = data.upgrades;
			this.pingInterval = data.pingInterval;
			this.pingTimeout = data.pingTimeout;
			this.onOpen();
			this.ping();
			this.removeListener("heartbeat", this.onHeartbeat);
			this.on("heartbeat", this.onHeartbeat)
		};
		Socket.prototype.onHeartbeat = function (timeout) {
			clearTimeout(this.pingTimeoutTimer);
			var self = this;
			self.pingTimeoutTimer = setTimeout(function () {
					if ("closed" == self.readyState)
						return;
					self.onClose("ping timeout")
				}, timeout || self.pingInterval + self.pingTimeout)
		};
		Socket.prototype.ping = function () {
			var self = this;
			clearTimeout(self.pingIntervalTimer);
			self.pingIntervalTimer = setTimeout(function () {
					debug("writing ping packet - expecting pong within %sms", self.pingTimeout);
					self.sendPacket("ping");
					self.onHeartbeat(self.pingTimeout)
				}, self.pingInterval)
		};
		Socket.prototype.flush = function () {
			if ("closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
				debug("flushing %d packets in socket", this.writeBuffer.length);
				this.transport.send(this.writeBuffer);
				this.writeBuffer = []
			}
		};
		Socket.prototype.write = Socket.prototype.send = function (msg) {
			this.sendPacket("message", msg);
			return this
		};
		Socket.prototype.sendPacket = function (type, data) {
			var packet = {
				type : type,
				data : data
			};
			this.emit("packetCreate", packet);
			this.writeBuffer.push(packet);
			this.flush()
		};
		Socket.prototype.close = function () {
			if ("opening" == this.readyState || "open" == this.readyState) {
				this.onClose("forced close");
				debug("socket closing - telling transport to close");
				this.transport.close();
				this.transport.removeAllListeners()
			}
			return this
		};
		Socket.prototype.onError = function (err) {
			this.emit("error", err);
			this.onClose("transport error", err)
		};
		Socket.prototype.onClose = function (reason, desc) {
			if ("closed" != this.readyState) {
				debug('socket close with reason: "%s"', reason);
				clearTimeout(this.pingIntervalTimer);
				clearTimeout(this.pingTimeoutTimer);
				this.readyState = "closed";
				this.emit("close", reason, desc);
				this.onclose && this.onclose.call(this);
				this.id = null
			}
		};
		function rnd() {
			return String(Math.random()).substr(5) + String(Math.random()).substr(5)
		}
	});
	require.register("learnboost-engine.io-client/lib/transport.js", function (module, exports, require) {
		var util = require("./util"),
		parser = require("./parser"),
		Emitter = require("./emitter");
		module.exports = Transport;
		function Transport(opts) {
			this.path = opts.path;
			this.host = opts.host;
			this.port = opts.port;
			this.secure = opts.secure;
			this.query = opts.query;
			this.timestampParam = opts.timestampParam;
			this.timestampRequests = opts.timestampRequests;
			this.readyState = ""
		}
		Emitter(Transport.prototype);
		Transport.prototype.onError = function (msg, desc) {
			var err = new Error(msg);
			err.type = "TransportError";
			err.description = desc;
			this.emit("error", err);
			return this
		};
		Transport.prototype.open = function () {
			if ("closed" == this.readyState || "" == this.readyState) {
				this.readyState = "opening";
				this.doOpen()
			}
			return this
		};
		Transport.prototype.close = function () {
			if ("opening" == this.readyState || "open" == this.readyState) {
				this.doClose();
				this.onClose()
			}
			return this
		};
		Transport.prototype.send = function (packets) {
			if ("open" == this.readyState) {
				this.write(packets)
			} else {
				throw new Error("Transport not open")
			}
		};
		Transport.prototype.onOpen = function () {
			this.readyState = "open";
			this.writable = true;
			this.emit("open")
		};
		Transport.prototype.onData = function (data) {
			this.onPacket(parser.decodePacket(data))
		};
		Transport.prototype.onPacket = function (packet) {
			this.emit("packet", packet)
		};
		Transport.prototype.onClose = function () {
			this.readyState = "closed";
			this.emit("close")
		}
	});
	require.register("learnboost-engine.io-client/lib/emitter.js", function (module, exports, require) {
		var Emitter;
		try {
			Emitter = require("emitter")
		} catch (e) {
			Emitter = require("emitter-component")
		}
		module.exports = Emitter;
		Emitter.prototype.addEventListener = Emitter.prototype.on;
		Emitter.prototype.removeEventListener = Emitter.prototype.off;
		Emitter.prototype.removeListener = Emitter.prototype.off;
		Emitter.prototype.removeAllListeners = function () {
			this._callbacks = {}

		}
	});
	require.register("learnboost-engine.io-client/lib/util.js", function (module, exports, require) {
		var pageLoaded = false;
		var global = "undefined" != typeof window ? window : global;
		exports.inherits = function inherits(a, b) {
			function c() {}

			c.prototype = b.prototype;
			a.prototype = new c
		};
		exports.keys = Object.keys || function (obj) {
			var ret = [];
			var has = Object.prototype.hasOwnProperty;
			for (var i in obj) {
				if (has.call(obj, i)) {
					ret.push(i)
				}
			}
			return ret
		};
		exports.on = function (element, event, fn, capture) {
			if (element.attachEvent) {
				element.attachEvent("on" + event, fn)
			} else if (element.addEventListener) {
				element.addEventListener(event, fn, capture)
			}
		};
		exports.load = function (fn) {
			if (global.document && document.readyState === "complete" || pageLoaded) {
				return fn()
			}
			exports.on(global, "load", fn, false)
		};
		if ("undefined" != typeof window) {
			exports.load(function () {
				pageLoaded = true
			})
		}
		exports.defer = function (fn) {
			if (!exports.ua.webkit || "undefined" != typeof importScripts) {
				return fn()
			}
			exports.load(function () {
				setTimeout(fn, 100)
			})
		};
		var rvalidchars = /^[\],:{}\s]*$/,
		rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
		rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
		rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
		rtrimLeft = /^\s+/,
		rtrimRight = /\s+$/;
		exports.parseJSON = function (data) {
			if ("string" != typeof data || !data) {
				return null
			}
			data = data.replace(rtrimLeft, "").replace(rtrimRight, "");
			if (global.JSON && JSON.parse) {
				return JSON.parse(data)
			}
			if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
				return new Function("return " + data)()
			}
		};
		exports.ua = {};
		exports.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function () {
			try {
				var a = new XMLHttpRequest
			} catch (e) {
				return false
			}
			return a.withCredentials != undefined
		}
		();
		exports.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent);
		exports.ua.gecko = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent);
		exports.ua.android = "undefined" != typeof navigator && /android/i.test(navigator.userAgent);
		exports.ua.ios = "undefined" != typeof navigator && /^(iPad|iPhone|iPod)$/.test(navigator.platform);
		exports.ua.ios6 = exports.ua.ios && /OS 6_/.test(navigator.userAgent);
		exports.request = function request(xdomain) {
			if ("undefined" != typeof process) {
				var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				return new XMLHttpRequest
			}
			if (xdomain && "undefined" != typeof XDomainRequest && !exports.ua.hasCORS) {
				return new XDomainRequest
			}
			try {
				if ("undefined" != typeof XMLHttpRequest && (!xdomain || exports.ua.hasCORS)) {
					return new XMLHttpRequest
				}
			} catch (e) {}

			if (!xdomain) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP")
				} catch (e) {}

			}
		};
		var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
		var parts = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
		exports.parseUri = function (str) {
			var m = re.exec(str || ""),
			uri = {},
			i = 14;
			while (i--) {
				uri[parts[i]] = m[i] || ""
			}
			return uri
		};
		exports.qs = function (obj) {
			var str = "";
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					if (str.length)
						str += "&";
					str += i + "=" + encodeURIComponent(obj[i])
				}
			}
			return str
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/index.js", function (module, exports, require) {
		var XHR = require("./polling-xhr"),
		JSONP = require("./polling-jsonp"),
		websocket = require("./websocket"),
		flashsocket = require("./flashsocket"),
		util = require("../util");
		exports.polling = polling;
		exports.websocket = websocket;
		exports.flashsocket = flashsocket;
		var global = "undefined" != typeof window ? window : global;
		function polling(opts) {
			var xhr,
			xd = false,
			isXProtocol = false;
			if (global.location) {
				var isSSL = "https:" == location.protocol;
				var port = location.port;
				if (Number(port) != port) {
					port = isSSL ? 443 : 80
				}
				xd = opts.host != location.hostname || port != opts.port;
				isXProtocol = opts.secure != isSSL
			}
			xhr = util.request(xd);
			if (isXProtocol && global.XDomainRequest && xhr instanceof global.XDomainRequest) {
				return new JSONP(opts)
			}
			if (xhr && !opts.forceJSONP) {
				return new XHR(opts)
			} else {
				return new JSONP(opts)
			}
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/polling.js", function (module, exports, require) {
		var Transport = require("../transport"),
		util = require("../util"),
		parser = require("../parser"),
		debug = require("debug")("engine.io-client:polling");
		module.exports = Polling;
		var global = "undefined" != typeof window ? window : global;
		function Polling(opts) {
			Transport.call(this, opts)
		}
		util.inherits(Polling, Transport);
		Polling.prototype.name = "polling";
		Polling.prototype.doOpen = function () {
			this.poll()
		};
		Polling.prototype.pause = function (onPause) {
			var pending = 0;
			var self = this;
			this.readyState = "pausing";
			function pause() {
				debug("paused");
				self.readyState = "paused";
				onPause()
			}
			if (this.polling || !this.writable) {
				var total = 0;
				if (this.polling) {
					debug("we are currently polling - waiting to pause");
					total++;
					this.once("pollComplete", function () {
						debug("pre-pause polling complete");
						--total || pause()
					})
				}
				if (!this.writable) {
					debug("we are currently writing - waiting to pause");
					total++;
					this.once("drain", function () {
						debug("pre-pause writing complete");
						--total || pause()
					})
				}
			} else {
				pause()
			}
		};
		Polling.prototype.poll = function () {
			debug("polling");
			this.polling = true;
			this.doPoll();
			this.emit("poll")
		};
		Polling.prototype.onData = function (data) {
			debug("polling got data %s", data);
			var packets = parser.decodePayload(data);
			for (var i = 0, l = packets.length; i < l; i++) {
				if ("opening" == this.readyState) {
					this.onOpen()
				}
				if ("close" == packets[i].type) {
					this.onClose();
					return
				}
				this.onPacket(packets[i])
			}
			this.polling = false;
			this.emit("pollComplete");
			if ("open" == this.readyState) {
				this.poll()
			} else {
				debug('ignoring poll - transport state "%s"', this.readyState)
			}
		};
		Polling.prototype.doClose = function () {
			debug("sending close packet");
			this.send([{
						type : "close"
					}
				])
		};
		Polling.prototype.write = function (packets) {
			var self = this;
			this.writable = false;
			this.doWrite(parser.encodePayload(packets), function () {
				self.writable = true;
				self.emit("drain")
			})
		};
		Polling.prototype.uri = function () {
			var query = this.query || {};
			var schema = this.secure ? "https" : "http";
			var port = "";
			if (global.ActiveXObject || util.ua.android || util.ua.ios6 || this.timestampRequests) {
				query[this.timestampParam] = +new Date
			}
			query = util.qs(query);
			if (this.port && ("https" == schema && this.port != 443 || "http" == schema && this.port != 80)) {
				port = ":" + this.port
			}
			if (query.length) {
				query = "?" + query
			}
			return schema + "://" + this.host + port + this.path + query
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/polling-xhr.js", function (module, exports, require) {
		var Polling = require("./polling"),
		util = require("../util"),
		Emitter = require("../emitter"),
		debug = require("debug")("engine.io-client:polling-xhr");
		module.exports = XHR;
		module.exports.Request = Request;
		var global = "undefined" != typeof window ? window : global;
		var xobject = global[["Active"].concat("Object").join("X")];
		function empty() {}

		function XHR(opts) {
			Polling.call(this, opts);
			if (global.location) {
				this.xd = opts.host != global.location.hostname || global.location.port != opts.port
			}
		}
		util.inherits(XHR, Polling);
		XHR.prototype.doOpen = function () {
			var self = this;
			util.defer(function () {
				Polling.prototype.doOpen.call(self)
			})
		};
		XHR.prototype.request = function (opts) {
			opts = opts || {};
			opts.uri = this.uri();
			opts.xd = this.xd;
			return new Request(opts)
		};
		XHR.prototype.doWrite = function (data, fn) {
			var req = this.request({
					method : "POST",
					data : data
				});
			var self = this;
			req.on("success", fn);
			req.on("error", function (err) {
				self.onError("xhr post error", err)
			});
			this.sendXhr = req
		};
		XHR.prototype.doPoll = function () {
			debug("xhr poll");
			var req = this.request();
			var self = this;
			req.on("data", function (data) {
				self.onData(data)
			});
			req.on("error", function (err) {
				self.onError("xhr poll error", err)
			});
			this.pollXhr = req
		};
		function Request(opts) {
			this.method = opts.method || "GET";
			this.uri = opts.uri;
			this.xd = !!opts.xd;
			this.async = false !== opts.async;
			this.data = undefined != opts.data ? opts.data : null;
			this.create()
		}
		Emitter(Request.prototype);
		Request.prototype.create = function () {
			var xhr = this.xhr = util.request(this.xd);
			var self = this;
			xhr.open(this.method, this.uri, this.async);
			if ("POST" == this.method) {
				try {
					if (xhr.setRequestHeader) {
						xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
					} else {
						xhr.contentType = "text/plain"
					}
				} catch (e) {}

			}
			if (this.xd && global.XDomainRequest && xhr instanceof XDomainRequest) {
				xhr.onerror = function (e) {
					self.onError(e)
				};
				xhr.onload = function () {
					self.onData(xhr.responseText)
				};
				xhr.onprogress = empty
			} else {
				if ("withCredentials" in xhr) {
					xhr.withCredentials = true
				}
				xhr.onreadystatechange = function () {
					var data;
					try {
						if (4 != xhr.readyState)
							return;
						if (200 == xhr.status || 1223 == xhr.status) {
							data = xhr.responseText
						} else {
							self.onError(xhr.status)
						}
					} catch (e) {
						self.onError(e)
					}
					if (undefined !== data) {
						self.onData(data)
					}
				}
			}
			debug("sending xhr with url %s | data %s", this.uri, this.data);
			xhr.send(this.data);
			if (xobject) {
				this.index = Request.requestsCount++;
				Request.requests[this.index] = this
			}
		};
		Request.prototype.onSuccess = function () {
			this.emit("success");
			this.cleanup()
		};
		Request.prototype.onData = function (data) {
			this.emit("data", data);
			this.onSuccess()
		};
		Request.prototype.onError = function (err) {
			this.emit("error", err);
			this.cleanup()
		};
		Request.prototype.cleanup = function () {
			this.xhr.onreadystatechange = empty;
			this.xhr.onload = this.xhr.onerror = empty;
			try {
				this.xhr.abort()
			} catch (e) {}

			if (xobject) {
				delete Request.requests[this.index]
			}
			this.xhr = null
		};
		Request.prototype.abort = function () {
			this.cleanup()
		};
		if (xobject) {
			Request.requestsCount = 0;
			Request.requests = {};
			global.attachEvent("onunload", function () {
				for (var i in Request.requests) {
					if (Request.requests.hasOwnProperty(i)) {
						Request.requests[i].abort()
					}
				}
			})
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/polling-jsonp.js", function (module, exports, require) {
		var Polling = require("./polling"),
		util = require("../util");
		module.exports = JSONPPolling;
		var global = "undefined" != typeof window ? window : global;
		var rNewline = /\n/g;
		var callbacks;
		var index = 0;
		function empty() {}

		function JSONPPolling(opts) {
			Polling.call(this, opts);
			if (!callbacks) {
				if (!global.___eio)
					global.___eio = [];
				callbacks = global.___eio
			}
			this.index = callbacks.length;
			var self = this;
			callbacks.push(function (msg) {
				self.onData(msg)
			});
			this.query.j = this.index
		}
		util.inherits(JSONPPolling, Polling);
		JSONPPolling.prototype.doOpen = function () {
			var self = this;
			util.defer(function () {
				Polling.prototype.doOpen.call(self)
			})
		};
		JSONPPolling.prototype.doClose = function () {
			if (this.script) {
				this.script.parentNode.removeChild(this.script);
				this.script = null
			}
			if (this.form) {
				this.form.parentNode.removeChild(this.form);
				this.form = null
			}
			Polling.prototype.doClose.call(this)
		};
		JSONPPolling.prototype.doPoll = function () {
			var script = document.createElement("script");
			if (this.script) {
				this.script.parentNode.removeChild(this.script);
				this.script = null
			}
			script.async = true;
			script.src = this.uri();
			var insertAt = document.getElementsByTagName("script")[0];
			insertAt.parentNode.insertBefore(script, insertAt);
			this.script = script;
			if (util.ua.gecko) {
				setTimeout(function () {
					var iframe = document.createElement("iframe");
					document.body.appendChild(iframe);
					document.body.removeChild(iframe)
				}, 100)
			}
		};
		JSONPPolling.prototype.doWrite = function (data, fn) {
			var self = this;
			if (!this.form) {
				var form = document.createElement("form"),
				area = document.createElement("textarea"),
				id = this.iframeId = "eio_iframe_" + this.index,
				iframe;
				form.className = "socketio";
				form.style.position = "absolute";
				form.style.top = "-1000px";
				form.style.left = "-1000px";
				form.target = id;
				form.method = "POST";
				form.setAttribute("accept-charset", "utf-8");
				area.name = "d";
				form.appendChild(area);
				document.body.appendChild(form);
				this.form = form;
				this.area = area
			}
			this.form.action = this.uri();
			function complete() {
				initIframe();
				fn()
			}
			function initIframe() {
				if (self.iframe) {
					self.form.removeChild(self.iframe)
				}
				try {
					iframe = document.createElement('<iframe name="' + self.iframeId + '">')
				} catch (e) {
					iframe = document.createElement("iframe");
					iframe.name = self.iframeId
				}
				iframe.id = self.iframeId;
				self.form.appendChild(iframe);
				self.iframe = iframe
			}
			initIframe();
			this.area.value = data.replace(rNewline, "\\n");
			try {
				this.form.submit()
			} catch (e) {}

			if (this.iframe.attachEvent) {
				this.iframe.onreadystatechange = function () {
					if (self.iframe.readyState == "complete") {
						complete()
					}
				}
			} else {
				this.iframe.onload = complete
			}
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/websocket.js", function (module, exports, require) {
		var Transport = require("../transport"),
		parser = require("../parser"),
		util = require("../util"),
		debug = require("debug")("engine.io-client:websocket");
		module.exports = WS;
		var global = "undefined" != typeof window ? window : global;
		function WS(opts) {
			Transport.call(this, opts)
		}
		util.inherits(WS, Transport);
		WS.prototype.name = "websocket";
		WS.prototype.doOpen = function () {
			if (!this.check()) {
				return
			}
			var self = this;
			this.socket = new(ws())(this.uri());
			this.socket.onopen = function () {
				self.onOpen()
			};
			this.socket.onclose = function () {
				self.onClose()
			};
			this.socket.onmessage = function (ev) {
				self.onData(ev.data)
			};
			this.socket.onerror = function (e) {
				self.onError("websocket error", e)
			}
		};
		WS.prototype.write = function (packets) {
			for (var i = 0, l = packets.length; i < l; i++) {
				this.socket.send(parser.encodePacket(packets[i]))
			}
		};
		WS.prototype.doClose = function () {
			if (typeof this.socket !== "undefined") {
				this.socket.close()
			}
		};
		WS.prototype.uri = function () {
			var query = this.query || {};
			var schema = this.secure ? "wss" : "ws";
			var port = "";
			if (this.port && ("wss" == schema && this.port != 443 || "ws" == schema && this.port != 80)) {
				port = ":" + this.port
			}
			if (this.timestampRequests) {
				query[this.timestampParam] = +new Date
			}
			query = util.qs(query);
			if (query.length) {
				query = "?" + query
			}
			return schema + "://" + this.host + port + this.path + query
		};
		WS.prototype.check = function () {
			var websocket = ws();
			return !!websocket && !("__initialize" in websocket && this.name === WS.prototype.name)
		};
		function ws() {
			if ("undefined" != typeof process) {
				return require("ws")
			}
			return global.WebSocket || global.MozWebSocket
		}
	});
	require.register("learnboost-engine.io-client/lib/transports/flashsocket.js", function (module, exports, require) {
		var WS = require("./websocket"),
		util = require("../util"),
		debug = require("debug")("engine.io-client:flashsocket");
		module.exports = FlashWS;
		var xobject = global[["Active"].concat("Object").join("X")];
		function FlashWS(options) {
			WS.call(this, options);
			this.flashPath = options.flashPath;
			this.policyPort = options.policyPort
		}
		util.inherits(FlashWS, WS);
		FlashWS.prototype.name = "flashsocket";
		FlashWS.prototype.doOpen = function () {
			if (!this.check()) {
				return
			}
			function log(type) {
				return function () {
					var str = Array.prototype.join.call(arguments, " ");
					debug("[websocketjs %s] %s", type, str)
				}
			}
			WEB_SOCKET_LOGGER = {
				log : log("debug"),
				error : log("error")
			};
			WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;
			WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
			if ("undefined" == typeof WEB_SOCKET_SWF_LOCATION) {
				WEB_SOCKET_SWF_LOCATION = this.flashPath + "WebSocketMainInsecure.swf"
			}
			var deps = [this.flashPath + "web_socket.js"];
			if ("undefined" == typeof swfobject) {
				deps.unshift(this.flashPath + "swfobject.js")
			}
			var self = this;
			load(deps, function () {
				self.ready(function () {
					WebSocket.__addTask(function () {
						WS.prototype.doOpen.call(self)
					})
				})
			})
		};
		FlashWS.prototype.doClose = function () {
			if (!this.socket)
				return;
			var self = this;
			WebSocket.__addTask(function () {
				WS.prototype.doClose.call(self)
			})
		};
		FlashWS.prototype.write = function () {
			var self = this,
			args = arguments;
			WebSocket.__addTask(function () {
				WS.prototype.write.apply(self, args)
			})
		};
		FlashWS.prototype.ready = function (fn) {
			if (typeof WebSocket == "undefined" || !("__initialize" in WebSocket) || !swfobject) {
				return
			}
			if (swfobject.getFlashPlayerVersion().major < 10) {
				return
			}
			function init() {
				if (!FlashWS.loaded) {
					if (843 != self.policyPort) {
						WebSocket.loadFlashPolicyFile("xmlsocket://" + self.host + ":" + self.policyPort)
					}
					WebSocket.__initialize();
					FlashWS.loaded = true
				}
				fn.call(self)
			}
			var self = this;
			if (document.body) {
				return init()
			}
			util.load(init)
		};
		FlashWS.prototype.check = function () {
			if ("undefined" != typeof process) {
				return false
			}
			if (typeof WebSocket != "undefined" && !("__initialize" in WebSocket)) {
				return false
			}
			if (xobject) {
				var control = null;
				try {
					control = new xobject("ShockwaveFlash.ShockwaveFlash")
				} catch (e) {}

				if (control) {
					return true
				}
			} else {
				for (var i = 0, l = navigator.plugins.length; i < l; i++) {
					for (var j = 0, m = navigator.plugins[i].length; j < m; j++) {
						if (navigator.plugins[i][j].description == "Shockwave Flash") {
							return true
						}
					}
				}
			}
			return false
		};
		var scripts = {};
		function create(path, fn) {
			if (scripts[path])
				return fn();
			var el = document.createElement("script");
			var loaded = false;
			debug('loading "%s"', path);
			el.onload = el.onreadystatechange = function () {
				if (loaded || scripts[path])
					return;
				var rs = el.readyState;
				if (!rs || "loaded" == rs || "complete" == rs) {
					debug('loaded "%s"', path);
					el.onload = el.onreadystatechange = null;
					loaded = true;
					scripts[path] = true;
					fn()
				}
			};
			el.async = 1;
			el.src = path;
			var head = document.getElementsByTagName("head")[0];
			head.insertBefore(el, head.firstChild)
		}
		function load(arr, fn) {
			function process(i) {
				if (!arr[i])
					return fn();
				create(arr[i], function () {
					process(++i)
				})
			}
			process(0)
		}
	});
	require.register("component-json/index.js", function (module, exports, require) {
		module.exports = "undefined" == typeof JSON ? require("json-fallback") : JSON
	});
	require.register("learnboost-socket.io-protocol/index.js", function (module, exports, require) {
		var json;
		try {
			json = require("json")
		} catch (e) {
			json = JSON
		}
		exports.protocol = 1;
		exports.types = ["CONNECT", "DISCONNECT", "EVENT", "ACK", "ERROR"];
		exports.CONNECT = 0;
		exports.DISCONNECT = 1;
		exports.EVENT = 2;
		exports.ACK = 3;
		exports.ERROR = 4;
		exports.encode = function (obj) {
			var str = "";
			var nsp = false;
			str += obj.type;
			if (obj.nsp && "/" != obj.nsp) {
				nsp = true;
				str += obj.nsp
			}
			if (obj.id) {
				if (nsp) {
					str += ",";
					nsp = false
				}
				str += obj.id
			}
			if (obj.data) {
				if (nsp)
					str += ",";
				str += json.stringify(obj.data)
			}
			return str
		};
		exports.decode = function (str) {
			var p = {};
			var i = 0;
			p.type = Number(str.charAt(0));
			if (null == exports.types[p.type])
				return error();
			if ("/" == str.charAt(i + 1)) {
				p.nsp = "";
				while (++i) {
					var c = str.charAt(i);
					if ("," == c)
						break;
					p.nsp += c;
					if (i + 1 == str.length)
						break
				}
			} else {
				p.nsp = "/"
			}
			var next = str.charAt(i + 1);
			if ("" != next && Number(next) == next) {
				p.id = "";
				while (++i) {
					var c = str.charAt(i);
					if (null == c || Number(c) != c) {
						--i;
						break
					}
					p.id += str.charAt(i);
					if (i + 1 == str.length)
						break
				}
			}
			if (str.charAt(++i)) {
				try {
					p.data = json.parse(str.substr(i))
				} catch (e) {
					return error()
				}
			}
			return p
		};
		function error(data) {
			return {
				type : exports.ERROR,
				data : "parser error"
			}
		}
	});
	require.register("component-emitter/index.js", function (module, exports, require) {
		module.exports = Emitter;
		function Emitter(obj) {
			if (obj)
				return mixin(obj)
		}
		function mixin(obj) {
			for (var key in Emitter.prototype) {
				obj[key] = Emitter.prototype[key]
			}
			return obj
		}
		Emitter.prototype.on = function (event, fn) {
			this._callbacks = this._callbacks || {};
			(this._callbacks[event] = this._callbacks[event] || []).push(fn);
			return this
		};
		Emitter.prototype.once = function (event, fn) {
			var self = this;
			this._callbacks = this._callbacks || {};
			function on() {
				self.off(event, on);
				fn.apply(this, arguments)
			}
			fn._off = on;
			this.on(event, on);
			return this
		};
		Emitter.prototype.off = function (event, fn) {
			this._callbacks = this._callbacks || {};
			var callbacks = this._callbacks[event];
			if (!callbacks)
				return this;
			if (1 == arguments.length) {
				delete this._callbacks[event];
				return this
			}
			var i = callbacks.indexOf(fn._off || fn);
			if (~i)
				callbacks.splice(i, 1);
			return this
		};
		Emitter.prototype.emit = function (event) {
			this._callbacks = this._callbacks || {};
			var args = [].slice.call(arguments, 1),
			callbacks = this._callbacks[event];
			if (callbacks) {
				callbacks = callbacks.slice(0);
				for (var i = 0, len = callbacks.length; i < len; ++i) {
					callbacks[i].apply(this, args)
				}
			}
			return this
		};
		Emitter.prototype.listeners = function (event) {
			this._callbacks = this._callbacks || {};
			return this._callbacks[event] || []
		};
		Emitter.prototype.hasListeners = function (event) {
			return !!this.listeners(event).length
		}
	});
	require.register("component-bind/index.js", function (module, exports, require) {
		var slice = [].slice;
		module.exports = function (obj, fn) {
			if ("string" == typeof fn)
				fn = obj[fn];
			if ("function" != typeof fn)
				throw new Error("bind() requires a function");
			var args = [].slice.call(arguments, 2);
			return function () {
				return fn.apply(obj, args.concat(slice.call(arguments)))
			}
		}
	});
	require.register("component-json-fallback/index.js", function (module, exports, require) {
		var JSON = {};
		(function () {
			"use strict";
			function f(n) {
				return n < 10 ? "0" + n : n
			}
			if (typeof Date.prototype.toJSON !== "function") {
				Date.prototype.toJSON = function (key) {
					return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
				};
				String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
					return this.valueOf()
				}
			}
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap,
			indent,
			meta = {
				"\b" : "\\b",
				"	" : "\\t",
				"\n" : "\\n",
				"\f" : "\\f",
				"\r" : "\\r",
				'"' : '\\"',
				"\\" : "\\\\"
			},
			rep;
			function quote(string) {
				escapable.lastIndex = 0;
				return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
				}) + '"' : '"' + string + '"'
			}
			function str(key, holder) {
				var i,
				k,
				v,
				length,
				mind = gap,
				partial,
				value = holder[key];
				if (value && typeof value === "object" && typeof value.toJSON === "function") {
					value = value.toJSON(key)
				}
				if (typeof rep === "function") {
					value = rep.call(holder, key, value)
				}
				switch (typeof value) {
				case "string":
					return quote(value);
				case "number":
					return isFinite(value) ? String(value) : "null";
				case "boolean":
				case "null":
					return String(value);
				case "object":
					if (!value) {
						return "null"
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === "[object Array]") {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || "null"
						}
						v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
						gap = mind;
						return v
					}
					if (rep && typeof rep === "object") {
						length = rep.length;
						for (i = 0; i < length; i += 1) {
							if (typeof rep[i] === "string") {
								k = rep[i];
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ": " : ":") + v)
								}
							}
						}
					} else {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ": " : ":") + v)
								}
							}
						}
					}
					v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
					gap = mind;
					return v
				}
			}
			if (typeof JSON.stringify !== "function") {
				JSON.stringify = function (value, replacer, space) {
					var i;
					gap = "";
					indent = "";
					if (typeof space === "number") {
						for (i = 0; i < space; i += 1) {
							indent += " "
						}
					} else if (typeof space === "string") {
						indent = space
					}
					rep = replacer;
					if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
						throw new Error("JSON.stringify")
					}
					return str("", {
						"" : value
					})
				}
			}
			if (typeof JSON.parse !== "function") {
				JSON.parse = function (text, reviver) {
					var j;
					function walk(holder, key) {
						var k,
						v,
						value = holder[key];
						if (value && typeof value === "object") {
							for (k in value) {
								if (Object.prototype.hasOwnProperty.call(value, k)) {
									v = walk(value, k);
									if (v !== undefined) {
										value[k] = v
									} else {
										delete value[k]
									}
								}
							}
						}
						return reviver.call(holder, key, value)
					}
					text = String(text);
					cx.lastIndex = 0;
					if (cx.test(text)) {
						text = text.replace(cx, function (a) {
								return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
							})
					}
					if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
						j = eval("(" + text + ")");
						return typeof reviver === "function" ? walk({
							"" : j
						}, "") : j
					}
					throw new SyntaxError("JSON.parse")
				}
			}
		})();
		module.exports = JSON
	});
	require.register("timoxley-to-array/index.js", function (module, exports, require) {
		module.exports = function toArray(collection) {
			if (typeof collection === "undefined")
				return [];
			if (collection === null)
				return [null];
			if (collection === window)
				return [window];
			if (typeof collection === "string")
				return [collection];
			if (Array.isArray(collection))
				return collection.slice();
			if (typeof collection.length != "number")
				return [collection];
			if (typeof collection === "function")
				return [collection];
			var arr = [];
			for (var i = 0; i < collection.length; i++) {
				if (collection.hasOwnProperty(i) || i in collection) {
					arr.push(collection[i])
				}
			}
			if (!arr.length)
				return [];
			return arr
		}
	});
	require.register("visionmedia-debug/index.js", function (module, exports, require) {
		if ("undefined" == typeof window) {
			module.exports = require("./lib/debug")
		} else {
			module.exports = require("./debug")
		}
	});
	require.register("visionmedia-debug/debug.js", function (module, exports, require) {
		module.exports = debug;
		function debug(name) {
			if (!debug.enabled(name))
				return function () {};
			return function (fmt) {
				var curr = new Date;
				var ms = curr - (debug[name] || curr);
				debug[name] = curr;
				fmt = name + " " + fmt + " +" + debug.humanize(ms);
				window.console && console.log && Function.prototype.apply.call(console.log, console, arguments)
			}
		}
		debug.names = [];
		debug.skips = [];
		debug.enable = function (name) {
			localStorage.debug = name;
			var split = (name || "").split(/[\s,]+/),
			len = split.length;
			for (var i = 0; i < len; i++) {
				name = split[i].replace("*", ".*?");
				if (name[0] === "-") {
					debug.skips.push(new RegExp("^" + name.substr(1) + "$"))
				} else {
					debug.names.push(new RegExp("^" + name + "$"))
				}
			}
		};
		debug.disable = function () {
			debug.enable("")
		};
		debug.humanize = function (ms) {
			var sec = 1e3,
			min = 60 * 1e3,
			hour = 60 * min;
			if (ms >= hour)
				return (ms / hour).toFixed(1) + "h";
			if (ms >= min)
				return (ms / min).toFixed(1) + "m";
			if (ms >= sec)
				return (ms / sec | 0) + "s";
			return ms + "ms"
		};
		debug.enabled = function (name) {
			for (var i = 0, len = debug.skips.length; i < len; i++) {
				if (debug.skips[i].test(name)) {
					return false
				}
			}
			for (var i = 0, len = debug.names.length; i < len; i++) {
				if (debug.names[i].test(name)) {
					return true
				}
			}
			return false
		};
		if (window.localStorage)
			debug.enable(localStorage.debug)
	});
	require.register("socket.io/lib/index.js", function (module, exports, require) {
		var url = require("./url"),
		parser = require("socket.io-parser"),
		Manager = require("./manager");
		module.exports = exports = lookup;
		var cache = exports.managers = {};
		function lookup(uri, opts) {
			opts = opts || {};
			var parsed = url(uri);
			var href = parsed.href;
			var io;
			if (opts.forceNew || false === opts.multiplex) {
				io = Manager(href, opts)
			} else {
				var id = parsed.id;
				if (!cache[id])
					cache[id] = Manager(href, opts);
				io = cache[id]
			}
			return io.socket(parsed.pathname || "/")
		}
		if ("undefined" != typeof process) {
			var read = require("fs").readFileSync;
			exports.source = read(__dirname + "/../socket.io-client.js")
		}
		exports.protocol = parser.protocol;
		exports.connect = lookup;
		exports.Manager = require("./manager");
		exports.Socket = require("./socket");
		exports.Emitter = require("./emitter")
	});
	require.register("socket.io/lib/manager.js", function (module, exports, require) {
		var url = require("./url"),
		eio = require("./engine"),
		Socket = require("./socket"),
		Emitter = require("./emitter"),
		parser = require("socket.io-parser"),
		on = require("./on"),
		debug = require("debug")("socket.io-client:manager"),
		object,
		bind;
		module.exports = Manager;
		function Manager(socket, opts) {
			if (!(this instanceof Manager))
				return new Manager(socket, opts);
			opts = opts || {};
			opts.path = opts.path || "/socket.io";
			this.nsps = {};
			this.subs = [];
			this.reconnection(opts.reconnection);
			this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
			this.reconnectionDelay(opts.reconnectionDelay || 1e3);
			this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
			this.timeout(null == opts.timeout ? 1e4 : opts.timeout);
			this.readyState = "closed";
			if (!socket || !socket.write)
				socket = eio(socket, opts);
			this.engine = socket;
			this.open()
		}
		Emitter(Manager.prototype);
		Manager.prototype.reconnection = function (v) {
			if (!arguments.length)
				return this._reconnection;
			this._reconnection = !!v;
			return this
		};
		Manager.prototype.reconnectionAttempts = function (v) {
			if (!arguments.length)
				return this._reconnectionAttempts;
			this._reconnectionAttempts = v;
			return this
		};
		Manager.prototype.reconnectionDelay = function (v) {
			if (!arguments.length)
				return this._reconnectionDelay;
			this._reconnectionDelay = v;
			return this
		};
		Manager.prototype.reconnectionDelayMax = function (v) {
			if (!arguments.length)
				return this._reconnectionDelayMax;
			this._reconnectionDelayMax = v;
			return this
		};
		Manager.prototype.timeout = function (v) {
			if (!arguments.length)
				return this._timeout;
			this._timeout = v;
			return this
		};
		Manager.prototype.open = Manager.prototype.connect = function (fn) {
			if (~this.readyState.indexOf("open"))
				return this;
			var socket = this.engine;
			var self = this;
			var timerSub;
			this.readyState = "opening";
			var openSub = on(socket, "open", bind(this, "onopen"));
			var errorSub = on(socket, "error", function (data) {
					self.cleanup();
					self.emit("connect_error", data);
					if (fn) {
						var err = new Error("Connection error");
						err.data = data;
						fn(err)
					}
				});
			if (false !== this._timeout) {
				var timeout = this._timeout;
				debug("connect attempt will timeout after %d", timeout);
				var timer = setTimeout(function () {
						debug("connect attempt timed out after %d", timeout);
						openSub.destroy();
						errorSub.destroy();
						socket.close();
						socket.emit("error", "timeout");
						self.emit("connect_timeout", timeout)
					}, timeout);
				timerSub = {
					destroy : function () {
						clearTimeout(timer)
					}
				};
				this.subs.push(timerSub)
			}
			this.subs.push(openSub);
			this.subs.push(errorSub);
			return this
		};
		Manager.prototype.onopen = function () {
			this.cleanup();
			this.readyState = "open";
			this.emit("open");
			var socket = this.engine;
			this.subs.push(on(socket, "data", bind(this, "ondata")));
			this.subs.push(on(socket, "error", bind(this, "onerror")));
			this.subs.push(on(socket, "close", bind(this, "onclose")))
		};
		Manager.prototype.ondata = function (data) {
			this.emit("packet", parser.decode(data))
		};
		Manager.prototype.onerror = function (err) {
			this.emit("error", err)
		};
		Manager.prototype.socket = function (nsp) {
			var socket = this.nsps[nsp];
			if (!socket) {
				socket = new Socket(this, nsp);
				this.nsps[nsp] = socket
			}
			return socket
		};
		Manager.prototype.destroy = function (socket) {
			delete this.nsps[socket.nsp];
			if (!object.length(this.nsps)) {
				this.close()
			}
		};
		Manager.prototype.cleanup = function () {
			var sub;
			while (sub = this.subs.shift())
				sub.destroy()
		};
		Manager.prototype.close = Manager.prototype.disconnect = function () {
			this.skipReconnect = true;
			this.cleanup();
			this.engine.close()
		};
		Manager.prototype.onclose = function () {
			this.cleanup();
			if (!this.skipReconnect) {
				var self = this;
				this.reconnect()
			}
		};
		Manager.prototype.reconnect = function () {
			var self = this;
			this.attempts++;
			if (this.attempts > this._reconnectionAttempts) {
				this.emit("reconnect_failed");
				this.reconnecting = false
			} else {
				var delay = this.attempts * this._reconnectionDelay;
				delay = Math.min(delay, this._reconnectionDelayMax);
				debug("will wait %d before reconnect attempt", delay);
				this.reconnecting = true;
				var timer = setTimeout(function () {
						debug("attemptign reconnect");
						self.open(function (err) {
							if (err) {
								debug("reconnect attempt error");
								self.reconnect();
								return self.emit("reconnect_error", err.data)
							} else {
								debug("reconnect success");
								self.onreconnect()
							}
						})
					}, delay);
				this.subs.push({
					destroy : function () {
						clearTimeout(timer)
					}
				})
			}
		};
		Manager.prototype.onreconnect = function () {
			var attempt = this.attempts;
			this.attempts = 0;
			this.reconnecting = false;
			this.emit("reconnect", attempt)
		};
		try {
			bind = require("bind");
			object = require("object")
		} catch (e) {
			bind = require("bind-component");
			object = require("object-component")
		}
	});
	require.register("socket.io/lib/engine.js", function (module, exports, require) {
		var engine;
		try {
			engine = require("engine.io-client")
		} catch (e) {
			engine = require("engine.io")
		}
		module.exports = engine
	});
	require.register("socket.io/lib/socket.js", function (module, exports, require) {
		var parser = require("socket.io-parser"),
		Emitter = require("./emitter"),
		toArray = require("to-array"),
		debug = require("debug")("socket.io-client:socket"),
		on = require("./on"),
		bind;
		module.exports = exports = Socket;
		var events = exports.events = ["connect", "disconnect", "error"];
		var emit = Emitter.prototype.emit;
		function Socket(io, nsp) {
			this.io = io;
			this.nsp = nsp;
			this.json = this;
			this.ids = 0;
			this.acks = {};
			this.open();
			this.buffer = [];
			this.connected = false
		}
		Emitter(Socket.prototype);
		Socket.prototype.open = Socket.prototype.connect = function () {
			var io = this.io;
			io.open();
			if ("open" == this.io.readyState)
				this.onopen();
			this.subs = [on(io, "open", bind(this, "onopen")), on(io, "error", bind(this, "onerror"))]
		};
		Socket.prototype.send = function () {
			var args = toArray(arguments);
			args.shift("message");
			this.emit.apply(this, args);
			return this
		};
		Socket.prototype.emit = function (ev) {
			if (~events.indexOf(ev)) {
				emit.apply(this, arguments)
			} else {
				var args = toArray(arguments);
				var packet = {
					type : parser.EVENT,
					args : args
				};
				if ("function" == typeof args[args.length - 1]) {
					debug("emitting packet with ack id %d", this.ids);
					this.acks[this.ids] = args.pop();
					packet.id = this.ids++
				}
				this.packet(packet)
			}
			return this
		};
		Socket.prototype.packet = function (packet) {
			packet.nsp = this.nsp;
			this.io.write(parser.encode(packet))
		};
		Socket.prototype.onerror = function (data) {
			this.emit("error", data)
		};
		Socket.prototype.onopen = function () {
			var io = this.io;
			this.subs.push(on(io, "packet", bind(this, "onpacket")), on(io, "close", bind(this, "onclose")))
		};
		Socket.prototype.onclose = function (reason) {
			debug("close (%s)", reason);
			this.emit("disconnect", reason)
		};
		Socket.prototype.onpacket = function (packet) {
			if (packet.nsp != this.nsp)
				return;
			switch (packet.type) {
			case parser.CONNECT:
				this.onconnect();
				break;
			case parser.EVENT:
				this.onevent(packet);
				break;
			case parser.ACK:
				this.onack(packet);
				break;
			case parser.DISCONNECT:
				this.ondisconnect();
				break;
			case parser.ERROR:
				this.emit("error", packet.data);
				break
			}
		};
		Socket.prototype.onevent = function (packet) {
			var args = packet.data || [];
			debug("emitting event %j", args);
			if (packet.id) {
				debug("attaching ack callback to event");
				args.push(this.ack(packet.id))
			}
			if (this.connected) {
				emit.apply(this, args)
			} else {
				this.buffer.push(args)
			}
		};
		Socket.prototype.ack = function () {
			var self = this;
			var sent = false;
			return function () {
				if (sent)
					return;
				var args = toArray(arguments);
				debug("sending ack %j", args);
				self.packet({
					type : parser.ACK,
					data : args
				})
			}
		};
		Socket.prototype.onack = function (packet) {
			debug("calling ack %s with %j", packet.id, packet.data);
			this.acks[packet.id].apply(this, packet.data);
			delete this.acks[packet.id]
		};
		Socket.prototype.onconnect = function () {
			this.emit("connect");
			this.connected = true;
			this.emitBuffered()
		};
		Socket.prototype.emitBuffered = function () {
			for (var i = 0; i < this.buffer.length; i++) {
				emit.apply(this, this.buffer[i])
			}
			this.buffer = []
		};
		Socket.prototype.ondisconnect = function () {
			debug("server disconnect (%s)", this.nsp);
			this.destroy()
		};
		Socket.prototype.destroy = function () {
			debug("destroying socket (%s)", this.nsp);
			for (var i = 0; i < this.subs.length; i++) {
				this.subs[i].destroy()
			}
			this.io.destroy(this)
		};
		Socket.prototype.close = Socket.prototype.disconnect = function () {
			debug("performing disconnect (%s)", this.nsp);
			this.packet(parser.PACKET_DISCONNECT);
			for (var i = 0; i < this.subs.length; i++) {
				this.subs[i].destroy()
			}
			this.io.destroy(this);
			this.onclose("io client disconnect");
			return this
		};
		try {
			bind = require("bind")
		} catch (e) {
			bind = require("bind-component")
		}
	});
	require.register("socket.io/lib/emitter.js", function (module, exports, require) {
		var Emitter;
		try {
			Emitter = require("emitter")
		} catch (e) {
			Emitter = require("emitter-component")
		}
		module.exports = Emitter;
		Emitter.prototype.removeListener = function (event, fn) {
			return this.off(event, fn)
		};
		Emitter.prototype.removeAllListeners = function () {
			this._callbacks = {};
			return this
		}
	});
	require.alias("learnboost-engine.io-client/lib/index.js", "socket.io/deps/engine.io/lib/index.js");
	require.alias("learnboost-engine.io-client/lib/parser.js", "socket.io/deps/engine.io/lib/parser.js");
	require.alias("learnboost-engine.io-client/lib/socket.js", "socket.io/deps/engine.io/lib/socket.js");
	require.alias("learnboost-engine.io-client/lib/transport.js", "socket.io/deps/engine.io/lib/transport.js");
	require.alias("learnboost-engine.io-client/lib/emitter.js", "socket.io/deps/engine.io/lib/emitter.js");
	require.alias("learnboost-engine.io-client/lib/util.js", "socket.io/deps/engine.io/lib/util.js");
	require.alias("learnboost-engine.io-client/lib/transports/index.js", "socket.io/deps/engine.io/lib/transports/index.js");
	require.alias("learnboost-engine.io-client/lib/transports/polling.js", "socket.io/deps/engine.io/lib/transports/polling.js");
	require.alias("learnboost-engine.io-client/lib/transports/polling-xhr.js", "socket.io/deps/engine.io/lib/transports/polling-xhr.js");
	require.alias("learnboost-engine.io-client/lib/transports/polling-jsonp.js", "socket.io/deps/engine.io/lib/transports/polling-jsonp.js");
	require.alias("learnboost-engine.io-client/lib/transports/websocket.js", "socket.io/deps/engine.io/lib/transports/websocket.js");
	require.alias("learnboost-engine.io-client/lib/transports/flashsocket.js", "socket.io/deps/engine.io/lib/transports/flashsocket.js");
	require.alias("learnboost-engine.io-client/lib/index.js", "socket.io/deps/engine.io/index.js");
	require.alias("component-emitter/index.js", "learnboost-engine.io-client/deps/emitter/index.js");
	require.alias("visionmedia-debug/index.js", "learnboost-engine.io-client/deps/debug/index.js");
	require.alias("visionmedia-debug/debug.js", "learnboost-engine.io-client/deps/debug/debug.js");
	require.alias("learnboost-socket.io-protocol/index.js", "socket.io/deps/socket.io-parser/index.js");
	require.alias("component-json/index.js", "learnboost-socket.io-protocol/deps/json/index.js");
	require.alias("component-emitter/index.js", "socket.io/deps/emitter/index.js");
	require.alias("component-bind/index.js", "socket.io/deps/bind/index.js");
	require.alias("component-json-fallback/index.js", "socket.io/deps/json-fallback/index.js");
	require.alias("timoxley-to-array/index.js", "socket.io/deps/to-array/index.js");
	require.alias("visionmedia-debug/index.js", "socket.io/deps/debug/index.js");
	require.alias("visionmedia-debug/debug.js", "socket.io/deps/debug/debug.js");
	if ("undefined" == typeof module) {
		window.eio = require("socket.io")
	} else {
		module.exports = require("socket.io")
	}
})();