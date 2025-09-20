import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { AnimatedSection } from "@/components/ui/animated-section";
// ByteaImageDisplay removed - now using Supabase Storage images

export default function About() {
  const { settings, shouldShow } = useSiteSettingsWithDefaults();

  // Debug logging
  console.log('🔍 About page - Settings:', {
    aboutImage: settings.aboutImage ? 'loaded' : 'missing'
  });



  const values = [
    {
      title: "Missão",
      content: "Garantir que todos os pets tenham acesso a cuidados de saúde de qualidade, proporcionando tranquilidade às famílias brasileiras que amam seus animais de estimação."
    },
    {
      title: "Visão",
      content: "Ser a principal referência em planos de saúde para pets no Brasil, reconhecida pela excelência no atendimento e compromisso com o bem-estar animal."
    },
    {
      title: "Valores",
      content: "Transparência, comprometimento com o bem-estar animal, atendimento humanizado, preços justos e acessibilidade para todas as famílias brasileiras."
    }
  ];

  return (
    <main className="page-section" style={{ backgroundColor: '#277677' }}>
      <div className="section-container">
        {/* Header */}
        <div className="page-header">
          <AnimatedSection animation="slideUp" delay={100}>
            <h1 className="page-title text-[var(--text-dark-primary)]">
              <span style={{ color: '#FFFFFF' }}>Sobre a</span> <span className="text-[var(--text-gold)]">UNIPET PLAN</span>
            </h1>
          </AnimatedSection>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center mb-20">
          <AnimatedSection animation="slideRight" delay={200}>
            <div>
              {/* About Image */}
            <div className="relative w-full mx-auto lg:mx-0" style={{ padding: '0', margin: '0' }}>
              <div 
                className="relative rounded-2xl shadow-2xl overflow-hidden" 
                style={{ 
                  position: 'relative',
                  aspectRatio: '7/6',
                  width: '100%',
                  height: 'auto',
                  overflow: 'hidden',
                  margin: '0',
                  padding: '0'
                }}
              >
                <img
                  src={settings?.aboutImageUrl || 'https://tkzzxsbwkgcdmcreducm.supabase.co/storage/v1/object/public/pet-images/site/about-veterinarian-exam.jpg'}
                  alt="Sobre a UNIPET PLAN"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
            </div>
          </AnimatedSection>
          <div>
            <AnimatedSection animation="slideLeft" delay={200}>
              <h2 className="section-title text-[var(--text-gold)] mb-6">Nossa História</h2>
            </AnimatedSection>
            <AnimatedSection animation="slideLeft" delay={300}>
              {shouldShow.ourStory && (
                <div className="text-lg leading-relaxed whitespace-pre-line" style={{ color: '#FFFFFF' }}>
                  {settings.ourStory}
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>



        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
          {values.map((item, index) => (
            <AnimatedSection key={index} animation="slideUp" delay={800 + (index * 200)}>
              <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{background: 'var(--bg-cream-light)'}}>
                <CardHeader>
                  <CardTitle className="text-2xl text-[var(--text-teal)]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: '#FFFFFF' }}>{item.content}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <AnimatedSection animation="slideUp" delay={600}>
            <h2 className="page-title text-[var(--text-dark-primary)]">
              <span style={{ color: '#FFFFFF' }}>Nosso</span> <span className="text-[var(--text-gold)]">Compromisso</span>
            </h2>
          </AnimatedSection>
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="slideUp" delay={700}>
              <p className="page-subtitle leading-relaxed mb-8" style={{ color: '#FFFFFF' }}>
                Nossa equipe é formada por veterinários, especialistas em seguros e profissionais
                apaixonados por animais. Trabalhamos incansavelmente para garantir que cada pet
                receba o cuidado que merece, quando precisa.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <AnimatedSection animation="slideUp" delay={800}>
                <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{background: 'var(--bg-cream-light)'}}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-[var(--text-teal)] mb-4">Atendimento Humanizado</h3>
                    <p style={{ color: '#FFFFFF' }}>
                      Tratamos cada pet como se fosse nosso, oferecendo cuidado personalizado
                      e suporte emocional para as famílias em momentos difíceis.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection animation="slideUp" delay={900}>
                <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{background: 'var(--bg-cream-light)'}}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-[var(--text-teal)] mb-4">Inovação Constante</h3>
                    <p style={{ color: '#FFFFFF' }}>
                      Investimos continuamente em tecnologia e processos para tornar
                      o acesso aos cuidados veterinários mais fácil e eficiente.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}