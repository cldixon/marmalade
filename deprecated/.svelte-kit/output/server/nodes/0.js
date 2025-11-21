

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.Bgql8MZj.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/D-GPnKkH.js"];
export const stylesheets = [];
export const fonts = [];
