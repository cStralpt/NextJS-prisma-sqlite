module.exports = {
  reactStrictMode: true,
};
// module.exports = (phase, { defaultConfig }) => {
//   return {
//     ...defaultConfig,

//     webpack: (config) => {
//       config.resolve = {
//         ...config.resolve,
//         fallback: {
//           fs: false,
//           path: false,
//           os: false,
//           process: false,
//           assert: false,
//         },
//       };
//       return config;
//     },
//     reactStrictMode: true,
//   };
// };
