import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
// ByteaImageDisplay removed - now using Supabase Storage images
import { memo, useMemo } from "react";


const AboutSection = memo(function AboutSection() {
  const { settings } = useSiteSettingsWithDefaults();

  // Memoizar o status da imagem para evitar re-cálculos
  const imageStatus = useMemo(() => ({
    hasImage: !!settings?.aboutImage,
    imageLoaded: settings.aboutImage ? 'loaded' : 'missing'
  }), [settings?.aboutImage]);

  // Otimizar logging para evitar spam no console
  useMemo(() => {
    console.log('🔍 AboutSection component - Settings:', imageStatus);
    return true;
  }, [imageStatus]);

  return (
    <section className="py-24 md:py-32 bg-[var(--bg-cream-light)]" id="sobre">
      <div className="section-container">
        <div className="backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-2xl shadow-xl" style={{background: 'var(--bg-cream-light)'}}>
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
            <div>
              <h2 className="md:text-4xl font-bold mb-6 text-[var(--text-dark-primary)] text-[28px]">
                Sobre a <span className="text-[var(--text-teal)]">UNIPET PLAN</span>
              </h2>
              <p className="text-[var(--text-dark-primary)] text-lg mb-6 leading-relaxed">
                Somos uma empresa brasileira especializada em planos de saúde para pets,
                comprometida em oferecer o melhor cuidado veterinário com preços acessíveis
                e atendimento humanizado.
              </p>
              <p className="text-[var(--text-dark-primary)] text-lg mb-8 leading-relaxed">
                Nossa missão é garantir que todos os pets tenham acesso a cuidados de saúde
                de qualidade, proporcionando tranquilidade às famílias brasileiras que amam
                seus animais de estimação.
              </p>
            </div>

            <div className="-mt-8">
              {/* About Image com lazy loading otimizado */}
              <div className="relative w-full mx-auto" style={{ padding: '0', margin: '0' }}>
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
                    src={settings.aboutImageUrl || 'https://tkzzxsbwkgcdmcreducm.supabase.co/storage/v1/object/public/pet-images/site/about-veterinarian-exam.jpg'}
                    alt="Sobre a UNIPET PLAN"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    key={settings.aboutImageUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;