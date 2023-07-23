
import {TocData} from '.'
  // translating the urls is odd; maybe we need both en and locale?
  // can we use push state to localize the url?

  const x : TocData[] =    [
      {
        name: 'Guides', // needs to be localized
        path: '/guides',
        // we shouldn't have a path to sections, we just pick the first child
        children: 
        [
            {
              name: "Tutorials",
              path: "/guides/tutorials",
              children: [
                {
                  name: "Getting Started with Solid",
                  path: "/guides/tutorials/getting-started-with-solid",
                  children: [
                    {
                      name: "Welcome",
                      path: "/guides/tutorials/getting-started-with-solid/welcome",
                    },
                    {
                      name: "Installing Solid",
                      path: "/guides/tutorials/getting-started-with-solid/installing-solid",
                    },
                    {
                      name: "Building UI with Components",
                      path: "/guides/tutorials/getting-started-with-solid/building-ui-with-components",
                    },
                    {
                      name: "Adding Interactivity with State",
                      path: "/guides/tutorials/getting-started-with-solid/adding-interactivity-with-state",
                    },
                    {
                      name: "Control Flow",
                      path: "/guides/tutorials/getting-started-with-solid/control-flow",
                    },
                    {
                      name: "Fetching Data",
                      path: "/guides/tutorials/getting-started-with-solid/fetching-data",
                    },
                  ],
                },
              ],
            },
            {
              name: "How-To Guides",
              path: "/guides/how-to-guides",
              children: [
                {
                  name: "Get Ready for Solid",
                  children: [
                    {
                      name: "Welcome",
                      path: "/guides/how-to-guides/get-ready-for-solid/",
                    },
                    {
                      name: "Installation & Setup",
                      path: "/guides/how-to-guides/get-ready-for-solid/installation-and-setup",
                    },
                    {
                      name: "Linting",
                      path: "/guides/how-to-guides/get-ready-for-solid/linting",
                    },
                  ],
                },
                {
                  name: "Styling In Solid",
                  path: "/guides/how-to-guides/styling-in-solid",
                  children: [
                    {
                      name: "Introduction",
                      path: "/guides/how-to-guides/styling-in-solid",
                    },
                    {
                      name: "CSS Modules",
                      path: "/guides/how-to-guides/styling-in-solid/css-modules",
                    },
                    {
                      name: "Sass",
                      path: "/guides/how-to-guides/styling-in-solid/sass",
                    },
                    {
                      name: "Less",
                      path: "/guides/how-to-guides/styling-in-solid/less",
                    },
                    {
                      name: "Tailwind CSS",
                      path: "/guides/how-to-guides/styling-in-solid/tailwind-css",
                    },
                    {
                      name: "UnoCSS",
                      path: "/guides/how-to-guides/styling-in-solid/unocss",
                    },
                    {
                      name: "WindiCSS",
                      path: "/guides/how-to-guides/styling-in-solid/windicss",
                    },
                  ],
                },
                {
                  name: "Comparison",
                  path: "/guides/how-to-guides/comparison",
                  children: [
                    {
                      name: "Vue",
                      path: "/guides/how-to-guides/comparison/vue",
                    },
                  ],
                },
              ],
            },
          ],
      },
      {
        name: 'Reference',
        path: '/references',
        children:  [
          {
            name: "Concepts",
            children: [
              {
                name: "Reactivity",
                children: [
                  {
                    name: "Reactivity Basics",
                    path: "/references/concepts/reactivity",
                  },
                  { name: "Tracking", path: "/references/concepts/tracking" },
                ],
              },
            ],
          },
          {
            name: "API",
            children: [
              {
                name: "API Reference",
                children: [{ name: "Coming Soon", path: "/references/api-reference" }],
              },
            ],
          },
        ],
      }
    ]
  
  export default x