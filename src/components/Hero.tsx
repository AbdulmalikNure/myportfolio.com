import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";
import { AdminLoginModal } from "./AdminLoginModal";
import { useToast } from "@/hooks/use-toast";

const professions = [
  "Graphic Designer",
  "Video Editor",
  "Website Developer",
];

export const Hero = () => {
  const [currentProfession, setCurrentProfession] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const profession = professions[currentProfession];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < profession.length) {
            setDisplayText(profession.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentProfession((prev) => (prev + 1) % professions.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentProfession]);

  // Handle profile image clicks for admin access (silent - no visual feedback)
  const handleProfileClick = () => {
    // Clear existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // If 7 clicks reached, open admin modal
    if (newClickCount === 7) {
      setShowAdminModal(true);
      setClickCount(0); // Reset counter
    } else {
      // Reset counter after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setClickCount(0);
      }, 3000);
      setClickTimeout(timeout);
    }
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-6 mb-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 cursor-pointer"
              onClick={handleProfileClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full blur-xl opacity-40" />
              <img
                src={profilePhoto}
                alt="Abdulmalik Nure Jemal"
                className="relative rounded-full w-full h-full object-cover border-4 border-primary/30 shadow-2xl select-none"
                draggable="false"
              />
            </motion.div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              Abdulmalik Nure Jemal
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-20 mb-8"
          >
            <h2 className="text-3xl md:text-5xl font-semibold">
              <span className="text-gradient">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Passionate about creating exceptional digital experiences through design and code
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("#skills")}
              className="bg-primary hover:bg-cyan-400 hover:scale-105 text-primary-foreground px-8 py-6 text-lg rounded-full glow transition-all duration-300"
            >
              View My Work
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={() => scrollToSection("#live-demo")}
      >
        <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
      </motion.div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </section>
  );
};
