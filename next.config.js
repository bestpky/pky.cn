const path = require('path')

module.exports = {
  // async redirects() {
  //   return needRedirectPostList.map((slug) => ({
  //     source: `/${slug}`,
  //     destination: `/post/${slug}`,
  //     permanent: true,
  //   }))
  // },
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}
