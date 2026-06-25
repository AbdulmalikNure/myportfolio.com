import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

export const Experience = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await apiClient.getExperience();
        setExperiences(response || []);
      } catch (error) {
        console.error("Failed to fetch experiences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${year}`;
  };

  if (loading) {
    return null; // or a loading skeleton
  }

  if (experiences.length === 0) {
    return null; // Don't show section if no experiences
  }

  return (
    <section id="experience" className="py-12 bg-gradient-to-b from-card/20 to-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">My Experience</span>
          </h2>
          <p className="text-muted-foreground text-lg">Professional journey and achievements</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-glass p-6 rounded-2xl hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{exp.position}</h3>
                  <p className="text-primary font-semibold mb-2">{exp.company}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date!)}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
