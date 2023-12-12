"use client";

import { Footer } from "flowbite-react";
import { usePathname } from "next/navigation";
import { BsFacebook } from "react-icons/bs";
import { MdEmail, MdPhoneIphone } from "react-icons/md";

export default function FooterComponent() {
  const pathName = usePathname();

  return (
    <Footer
      className={`${
        pathName.includes("admin") ? "ml-64 w-auto" : ""
      } px-6 py-7 rounded-none border-t dark:border-none`}
    >
      <div className="w-full">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div>
            <Footer.Brand
              href="/"
              src="/ac_logo_transparent.svg"
              alt="F. Pamplona Logo"
              name="F. Pamplona"
            />
          </div>
          {/* <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="about" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Flowbite</Footer.Link>
                <Footer.Link href="#">Tailwind CSS</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow us" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Github</Footer.Link>
                <Footer.Link href="#">Discord</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Privacy Policy</Footer.Link>
                <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div> */}
        </div>
        <Footer.Divider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="/"
            by="F. Pamplona's Refrigeration and Air Conditioning Services™"
            year={new Date().getFullYear()}
          />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <Footer.Icon href="tel:+639324156997" icon={MdPhoneIphone} />
            <Footer.Icon
              href="https://www.facebook.com/fpamplonarefandaircon?mibextid=LQQJ4d"
              icon={BsFacebook}
            />
            <Footer.Icon href="mailto:pampystrading@gmail.com" icon={MdEmail} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
