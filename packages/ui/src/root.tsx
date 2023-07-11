

import { LanguageProvider, LoginProvider, ThemeProvider, ThemeBootstrap } from "./provider";
import { Router, RouterOutlet } from "./provider/router";

export default () => {
  return (
    <>
      <Router>
      <LanguageProvider avail='en es iw' default='en'>
      <LoginProvider  >
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        
      </head>
      <body lang="en" class='prose dark:prose-invert dark:bg-black dark:text-white'>
        <ThemeProvider />
          <RouterOutlet/>
        <ThemeBootstrap />
      </body>
      </LoginProvider>
      </LanguageProvider>
      </Router>
    </>
  );
};

