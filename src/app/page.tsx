import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import Gallery from "@/components/Gallery";
import WeddingPhotos from "@/components/WeddingPhotos";
import WeddingDetails from "@/components/WeddingDetails";
import RSVP from "@/components/RSVP";
import Guestbook from "@/components/Guestbook";
import MusicPlayer from "@/components/MusicPlayer";
import ShareButton from "@/components/ShareButton";
import InvitationVideo from "@/components/InvitationVideo";
import AboutLogo from "@/components/AboutLogo";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <OurStory />
      <InvitationVideo />
      <Gallery />
      <WeddingDetails />
      <RSVP />
      <Guestbook />
      <ShareButton />
      <MusicPlayer />
      <AboutLogo />
      <WeddingPhotos />
      <Footer />
      <AnalyticsTracker />
    </main>
  );
}
