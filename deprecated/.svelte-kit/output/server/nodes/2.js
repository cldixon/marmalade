

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.B3ndyoGy.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/8zFLh0hn.js","_app/immutable/chunks/D-GPnKkH.js","_app/immutable/chunks/CmHViV2Q.js","_app/immutable/chunks/2h9hLit5.js"];
export const stylesheets = [];
export const fonts = [];
