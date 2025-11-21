export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BPd4soyS.js",app:"_app/immutable/entry/app.i2KTT9ak.js",imports:["_app/immutable/entry/start.BPd4soyS.js","_app/immutable/chunks/BRjwc-cY.js","_app/immutable/chunks/CmHViV2Q.js","_app/immutable/chunks/D-GPnKkH.js","_app/immutable/entry/app.i2KTT9ak.js","_app/immutable/chunks/D-GPnKkH.js","_app/immutable/chunks/CmHViV2Q.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/2h9hLit5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base = "";