import Link from "next/link";

export default function Home() {
  return (
      <main className=" p-4 max-w-md mx-auto rounded-lg shadow-md">
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="tracking-[-.01em]">
            This is a personal project made for the assignment for my college work.
          </li>
          <li className="tracking-[-.01em]">
            Utilizes time api from the https://timeapi.io/swagger/index.html.
          </li>
          <li className="tracking-[-.01em]">
            This service is up untill the desired outcome is achieved.
          </li>
          <li className="tracking-[-.01em]">
            No CopyRights are issued and No Commercial License Approved.
          </li>
          <li className="tracking-[-.01em]">
            Future Version are in progress to add more feautres and functionalities.
          </li>
          <li className="tracking-[-.01em]">
            The code gathers IP adress from the browser then fetches the location and timezone based on the ip adress location.
          </li>
          <li className="tracking-[-.01em]">
            The code gathers localtime and theme from the device to set the timezone and theme.
          </li>
          <li className="tracking-[-.01em]">
            <Link href="/home">Home Page contains the dashbaord for conversion.</Link></li>
          <li className="tracking-[-.01em]"> 
            <Link href="/preferences">Preferences Page contains settings stored in local storage.</Link></li>
            <li className="tracking-[-.01em]">
              <Link href="/aboutus">About Us contains inforation and the vision of the website.</Link></li>

        </ol>

      </main>

  );
}
