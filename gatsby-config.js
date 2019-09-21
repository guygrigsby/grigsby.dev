module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `grigsby.dev`,
    author: `Guy Grigsby`,
    description: `Maybe I'll write blog posts if I maintain the blog.`,
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/usernamevalid`,
      },
      {
        name: `github`,
        url: `https://github.com/guygrigsby`,
      },
    ],
  },
}
