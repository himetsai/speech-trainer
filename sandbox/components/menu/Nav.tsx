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
          className="absolute top-4 right-4 cursor-pointer w-8 h-8" 
          onClick={() => setShowInfoModal(true)}
        />
        <div className="hidden text-xs md:block lg:text-sm"></div>
      </div>

      {showInfoModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold mb-2">About This Site</h2>
            <p>Some information about the site...</p>
            <button onClick={() => setShowInfoModal(false)} className="mt-4 p-2 bg-blue-500 text-white rounded">Close</button>
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
