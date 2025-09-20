import FaqSection from "@/components/sections/faq-section";
import { AnimatedSection } from "@/components/ui/animated-section";

export default function FAQ() {
  return (
    <main className="page-section bg-[var(--bg-teal)] min-h-screen">
      <div className="section-container">
        <div className="page-header">
          <AnimatedSection animation="slideUp" delay={100}>
            <h1 className="page-title text-[var(--text-light)]">
              Tire suas <span className="text-[var(--text-gold)]">dúvidas</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={200}>
            <p className="page-subtitle text-[var(--text-light)]">
              Selecionamos as perguntas mais comuns de nossos clientes
            </p>
          </AnimatedSection>
        </div>
        
        {/* FAQ Section */}
        <AnimatedSection animation="slideUp" delay={300}>
          <FaqSection 
            showTitle={false} 
            customColors={{
              background: 'var(--bg-teal)',
              titleColor: 'var(--text-light)',
              subtitleColor: 'var(--text-light)'
            }}
          />
        </AnimatedSection>
      </div>
    </main>
  );
}