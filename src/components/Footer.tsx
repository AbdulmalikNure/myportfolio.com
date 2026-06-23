import { motion } from "framer-motion";
import { Send, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-card/50 backdrop-blur-lg border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <div className="text-2xl font-bold text-gradient mb-2">Abdulmalik Nure Jemal</div>
            <p className="text-muted-foreground">© 2026 All Rights Reserved</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-6"
          >
            <a
              href="https://t.me/Abdulmalik_nure"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center hover:scale-110 hover:from-cyan-400 hover:to-primary transition-all duration-300 glow"
              aria-label="Telegram"
            >
              <Send className="w-6 h-6 text-white" />
            </a>
            <a
              href="https://www.youtube.com/@AbdulmalikNure"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center hover:scale-110 hover:from-pink-500 hover:to-red-500 transition-all duration-300 glow"
              aria-label="YouTube"
            >
              <Youtube className="w-6 h-6 text-white" />
            </a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
