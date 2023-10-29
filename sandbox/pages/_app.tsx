import "../styles/globals.css";
import "@fontsource/poppins";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

import type { AppProps } from "next/app";
import { Auth } from "../components/menu/Auth";
import Head from "next/head";
import { Nav } from "../components/menu/Nav";
import { Toolbar } from "../components/menu/Toolbar";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>Interview Trainer</title>
        <meta name="title" content="Rhetoric" />
        <meta name="description" content="Rhetoric" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-full flex-col font-main font-thin text-neutral-800">
        <Auth>
          <Nav />
          <div className="flex h-full w-full">
            <Component {...pageProps} />
          </div>
        </Auth>
      </div>
    </>
  );
}
