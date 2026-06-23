import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import cert1 from "@/assets/programming cerificates.png";
import cert2 from "@/assets/Ai certificates.png";
import cert3 from "@/assets/full stack cerificates.png";
import cert4 from "@/assets/graphic design certificates.png";
import cert5 from "@/assets/hackathon certificate.jpg";

const demoImages = [work1, work2, work3, work4, work5, work6];

const certImages = [cert1, cert3, cert4, cert2, cert5];

const certLabels = [
  "Programming Fundamentals – Udacity",
  "Full Stack (MERN) – Haramaya University",
  "Graphics Design – Amen Creative",
  "AI Fundamentals – Udacity",
  "Cursor Hackathon East Ethiopia 2026",
];

interface MarqueeRowProps {
  images: string[];
  labels?: string[];
  itemWidth: number;
  itemHeight: number;
  gap: number;
  duration: number;
  altPrefix: string;
}

const MarqueeRow = ({
  images,
  labels,
  itemWidth,
  itemHeight,
  gap,
  duration,
  altPrefix,
}: MarqueeRowProps) => {
  const controls = useAnimation();
  const [paused, setPaused] = useState(false);
  const items = [...images, ...images];
  const totalWidth = images.length * (itemWidth + gap);

  useEffect(() => {
    if (paused) {
      controls.stop();
    } else {
      controls.start({
        x: [0, -totalWidth],
        transition: {
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        },
      });
    }
  }, [paused, controls, totalWidth, duration]);

  // Start on mount
  useEffect(() => {
    controls.start({
      x: [0, -totalWidth],
      transition: {
        duration,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      },
    });
  }, []);

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        animate={controls}
        className="flex"
        style={{ gap: `${gap}px`, width: "max-content" }}
      >
        {items.map((src, index) => {
          const label = labels
            ? labels[index % labels.length]
            : `${altPrefix} ${(index % images.length) + 1}`;
          return (
            <div
              key={index}
              className="flex-shrink-0 rounded-2xl overflow-hidden card-glass shadow-lg cursor-pointer"
              style={{ width: `${itemWidth}px`, height: `${itemHeight}px` }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <img
                src={src}
                alt={label}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const LiveDemo = () => {
  return (
    <section id="live-demo" className="py-20 overflow-hidden bg-gradient-to-b from-background to-card/20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient">Live Demo</span>
        </h2>
        <p className="text-muted-foreground text-lg">Showcasing recent projects and creative work</p>
      </motion.div>

      {/* Work images row */}
      <div className="mb-6">
        <MarqueeRow
          images={demoImages}
          itemWidth={400}
          itemHeight={300}
          gap={24}
          duration={30}
          altPrefix="Work"
        />
      </div>

      {/* Certificates section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 mb-8 text-center"
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="text-gradient">Certificates</span>
        </h3>
        <p className="text-muted-foreground">Verified achievements and program completions</p>
      </motion.div>

      {/* Certificates row */}
      <MarqueeRow
        images={certImages}
        labels={certLabels}
        itemWidth={520}
        itemHeight={370}
        gap={24}
        duration={30}
        altPrefix="Certificate"
      />
    </section>
  );
};
