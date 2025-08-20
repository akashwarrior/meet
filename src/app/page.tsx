import Header from "@/components/header";
import Image from "next/image";
import MeetingActions from "@/components/home/meetingActions";

export default async function Home() {
  return (
    <main className="bg-background relative">
      <Header />

      <section className="mx-auto flex flex-col md:px-4 py-12 md:py-5 md:flex-row items-center justify-between max-w-7xl">
        <div className="max-w-lg md:mb-0 m-10">
          <h1 className="text-3xl md:text-5xl text-foreground mb-6">
            Video calls and meetings for everyone
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Connect, collaborate and celebrate from anywhere with Meet
          </p>

          <MeetingActions />

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-muted-foreground">
              <span className="text-primary hover:underline cursor-pointer">
                Learn more
              </span>{" "}
              about Meet
            </p>
          </div>
        </div>

        <div className="max-w-lg m-5 md:mx-auto">
          <Image
            width={500}
            height={500}
            priority
            src="/img.jpeg"
            alt="People in a video conference"
            className="w-full rounded-lg"
          />
        </div>
      </section>
    </main>
  );
}
