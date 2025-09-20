"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useLocation } from "wouter";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  description?: string;
  buttonText: string;
  href?: string;
  isPopular: boolean;
  planType?: string;
  image?: string;
}

interface PricingProps {
  plans: PricingPlan[];
  onPlanSelect?: (plan: PricingPlan) => void;
  onPlanDetails?: (planName: string) => void;
}


const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export function Pricing({
  plans,
  onPlanSelect,
  onPlanDetails
}: PricingProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [, navigate] = useLocation();

  const handlePlanSelect = (plan: PricingPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
    } else {
      // Use the checkout route based on plan ID
      navigate(`/checkout?plan=${plan.id}`);
    }
  };

  const handlePlanDetails = (planName: string) => {
    if (onPlanDetails) {
      onPlanDetails(planName);
    }
  };

  // Função para obter texto de coparticipação
  const getCoParticipationText = (planType?: string): string => {
    return planType === "with_waiting_period" ? "Sem coparticipação" : "Com coparticipação";
  };

  return (
    <div>
      <div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto perspective-1000 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0 }}
              whileInView={{
                opacity: 1,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              className={cn(
                "rounded-2xl border-[1px] bg-[var(--bg-cream-light)] text-center flex flex-col relative transform-style-preserve-3d backface-hidden transition-all duration-300 hover:shadow-2xl",
                plan.isPopular ? "border-[var(--text-gold)] border-2" : "border-[var(--border-teal-light)]",
                // Apply 3D effects only on desktop and when there are exactly 3 plans visible
                isDesktop && plans.length >= 3 && [
                  index === 0 && "pricing-card-left",
                  index === 1 && plan.isPopular && "pricing-card-popular", 
                  index === 2 && "pricing-card-right"
                ]
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-[var(--text-gold)] py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                  <Star className="text-[var(--text-light)] h-4 w-4 fill-current" />
                  <span className="text-[var(--text-light)] ml-1 font-sans font-semibold">
                    Popular
                  </span>
                </div>
              )}

              <div className="flex flex-col h-full p-6">
                {/* Conteúdo superior */}
                <div className="flex-1">
                  {/* Nome do plano */}
                  <div className="flex items-center justify-center mb-6">
                    <p className="text-base font-semibold text-[var(--text-dark-primary)]">
                      {plan.name}
                    </p>
                  </div>

                  {/* Preço */}
                  <div className="mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold tracking-tight text-[var(--text-teal)]">
                      R$ {formatPrice(plan.price)}/{plan.period}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-[var(--text-dark-primary)] mb-4">
                    {plan.planType === "with_waiting_period" ? "faturamento anual" : "faturamento mensal"}
                  </p>

                  {/* Lista de recursos */}
                  <ul className="mt-5 gap-2 flex flex-col mb-8 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[var(--text-teal)] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[var(--text-dark-primary)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conteúdo inferior fixo */}
                <div className="mt-auto">
                  <hr className="w-full my-4 border-[var(--border-teal-light)]" />

                  {/* Botão principal */}
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={cn(
                      "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter mb-4",
                      "transform-gpu transition-all duration-300 ease-out",
                      "rounded-lg py-3 px-6",
                      plan.isPopular
                        ? "text-[var(--btn-cotacao-gratuita-text)]"
                        : "text-[var(--btn-ver-planos-text)]"
                    )}
                    style={{
                      background: plan.isPopular 
                        ? 'var(--btn-cotacao-gratuita-bg)' 
                        : 'var(--btn-ver-planos-bg)',
                      border: 'none'
                    }}
                  >
                    {plan.buttonText}
                  </button>

                  {/* Badge de coparticipação */}
                  <div className="mb-4 text-center">
                    <span 
                      className="inline-block px-3 py-1 text-xs font-semibold rounded-full" 
                      style={{
                        background: 'var(--bg-teal)', 
                        color: 'var(--text-light)'
                      }}
                    >
                      {getCoParticipationText(plan.planType)}
                    </span>
                  </div>

                  {/* Link "Ver detalhes" */}
                  <button
                    className="w-full text-[var(--text-gold)] text-sm font-medium cursor-pointer flex items-center justify-center gap-1 hover:text-[var(--text-gold)]/80 transition-colors"
                    onClick={() => handlePlanDetails(plan.name)}
                  >
                    Ver detalhes
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="16px"
                      viewBox="0 -960 960 960"
                      width="16px"
                      fill="currentColor"
                      className="translate-y-0.5"
                    >
                      <path d="M480-240 240-480l56-56 144 144v-368h80v368l144-144 56 56-240 240Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}