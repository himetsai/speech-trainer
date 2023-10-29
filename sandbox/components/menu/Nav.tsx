import Link from "next/link";
import { useEffect, useRef, useState, FC } from "react";
// import infoImage from '/info.png';

export function Nav() {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div>
      <div className="flex w-full items-center justify-between px-10 py-0 md:w-auto md:rounded-full">
        <img src="/wordart.png" alt="logo" width={200} />
        <img
          src="/info.png"
          alt="Info"
          className="absolute top-4 right-4 h-8 w-8 cursor-pointer"
          onClick={() => setShowInfoModal(true)}
        />
        <div className="hidden text-xs md:block lg:text-sm"></div>
      </div>

      

      {showInfoModal && (
        <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
          <div className="rounded bg-white p-4">
            <h2 className="mb-2 text-xl font-bold">About This Site</h2>
            <p>Some information about the site...</p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-4 rounded bg-blue-500 p-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* <div className="w-full border-b-2 border-neutral-200"></div> */}
    </div>
  );
}

type NavItemProps = {
  route: string;
  name: string;
};

function NavItem({ route, name }: NavItemProps) {
  return (
    <Link
      href={route}
      className="mr-2 rounded-full py-2 px-3 duration-200 hover:bg-neutral-200 hover:ease-linear"
    >
      <div className="block font-medium text-neutral-800 md:inline-block">
        {name}
      </div>
    </Link>
  );
}
