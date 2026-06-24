import { motion } from "framer-motion";
import { useState } from "react";
import { FileText } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";
import { CVModal } from "@/components/CVModal";

export const About = () => {
  const [cvModalOpen, setCvModalOpen] = useState(false);

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-card/20 to-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">About Me</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left — profile photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-3xl blur-2xl opacity-30" />
              <img
                src={profilePhoto}
                alt="Abdulmalik Nure Jemal"
                className="relative rounded-3xl w-full shadow-2xl border-4 border-primary/20"
              />
            </div>
          </motion.div>

          {/* Right — bio + stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-foreground leading-relaxed mb-4">
              My name is{" "}
              <span className="text-primary font-semibold">Abdulmalik Nure Jemal</span>. I was born
              in East Arsi Zone, Robe Woreda in 1994. I am 24 years old with a passion for creating
              exceptional digital experiences through design and code.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              I completed my elementary education (Grade 1-8) at Habe Elementary School from 2002 to
              2009 E.C, followed by my high school education (Grade 9-10) at Habe Secondary School.
              I then attended Robe Didea School for Grade 11 &amp; 12 in 2012 and 2013 E.C.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              In 2014 E.C, I successfully passed the Entrance Exam and was admitted to Haramaya
              University. Currently, I am Graduated from Haramaya University by Information System
              Department, where I continue to develop my skills in graphic design, video editing, and
              web development.
            </p>

            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {/* Years Experience */}
              <div className="card-glass p-4 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-1">3+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>

              {/* Projects Completed */}
              <div className="card-glass p-4 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-1">7+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>

              {/* My CV — clickable card */}
              <motion.button
                onClick={() => setCvModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                aria-label="View my CV documents"
                className="card-glass p-4 rounded-xl text-left cursor-pointer
                           hover:border-primary/50 hover:shadow-[0_0_20px_hsla(190,100%,50%,0.2)]
                           transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400
                                flex items-center justify-center mb-2 glow">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-semibold text-primary">My CV</div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CV Modal */}
      <CVModal isOpen={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </section>
  );
};
