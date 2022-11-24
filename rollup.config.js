import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorAAOSDataUtils',
      globals: {
        '@capacitor/core': 'capacitorExports',
        '@trapezedev/project' : 'trapezeExports',
        'fs' : 'fsExports'
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins :[nodeResolve()],
  external: ['@capacitor/core','@trapezedev/project',],
};