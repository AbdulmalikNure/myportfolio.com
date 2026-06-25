import { motion } from "framer-motion";
import { Palette, Video, Code } from "lucide-react";
import { useEffect, useState } from "react";

const coreSkills = [
  { name: "Graphic Design", icon: Palette, color: "from-pink-500 to-rose-500" },
  { name: "Video Editing", icon: Video, color: "from-purple-500 to-indigo-500" },
  { name: "Website Development", icon: Code, color: "from-cyan-500 to-blue-500" },
];

const technicalSkills = {
  frontend: [
    { name: "HTML", level: 85 },
    { name: "CSS", level: 80 },
    { name: "JavaScript", level: 70 },
  ],
  backend: [
    { name: "Node.js", level: 65 },
    { name: "Express.js", level: 70 },
    { name: "React", level: 65 },
    { name: "Angular", level: 70 },
  ],
};

const SkillBar = ({ name, level, delay }: { name: string; level: number; delay: number }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), delay);
    return () => clearTimeout(timer);
  }, [level, delay]);

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-foreground font-medium">{name}</span>
        <span className="text-primary font-semibold">{level}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-cyan-400"
        />
      </div>
    </div>
  );
};

export const Skills = () => {
  return (
    <section id="skills" className="py-12 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">My Skills</span>
          </h2>
          <p className="text-muted-foreground text-lg">Expertise across design, video, and development</p>
        </motion.div>

        {/* Core Skills */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {coreSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="card-glass p-8 rounded-2xl text-center hover:scale-105 transition-transform"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center glow`}>
                <skill.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
            </motion.div>
          ))}
        </div>

        {/* Technical Skills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient">Technical Proficiency</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="card-glass p-8 rounded-2xl">
              <h4 className="text-2xl font-semibold mb-6 text-primary">Frontend</h4>
              {technicalSkills.frontend.map((skill, index) => (
                <SkillBar key={skill.name} {...skill} delay={index * 200} />
              ))}
            </div>

            <div className="card-glass p-8 rounded-2xl">
              <h4 className="text-2xl font-semibold mb-6 text-primary">Backend & Frameworks</h4>
              {technicalSkills.backend.map((skill, index) => (
                <SkillBar key={skill.name} {...skill} delay={index * 200 + 400} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
