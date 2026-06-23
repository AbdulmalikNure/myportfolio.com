import { motion } from "framer-motion";
import { Palette, Video, Globe } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Graphic Design",
    description:
      "Creating logos, brand identities, social media graphics, and print materials that are visually stunning and communicate effectively.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Video,
    title: "Video Editing",
    description:
      "Crafting engaging and dynamic video content, including commercials, social media clips, and promotional videos, with smooth transitions and effects.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Globe,
    title: "Website Development",
    description:
      "Building responsive, fast, and user-friendly websites and web applications using modern frontend and backend technologies.",
    gradient: "from-cyan-500 to-blue-500",
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-card/20 to-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">My Services</span>
          </h2>
          <p className="text-muted-foreground text-lg">Comprehensive solutions for your digital needs</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="card-glass p-8 rounded-2xl hover:scale-105 transition-all group"
            >
              <div
                className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center group-hover:glow transition-all`}
              >
                <service.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
